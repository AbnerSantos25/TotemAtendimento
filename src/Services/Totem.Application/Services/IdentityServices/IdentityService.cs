using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Totem.Application.Models;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.RefreshTokenAggregate.Events;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Models.IdentityModels;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.IdentityServices
{
    public class IdentityService : BaseService, IIdentityService, IIdentityIntegrationService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IMediator _mediator;
        private readonly IRefreshTokenRepository _refreshTokenRepository;


        public IdentityService(INotificator notificador,
                         UserManager<User> userManager,
                         SignInManager<User> signInManager,
                         IOptions<JwtSettings> jwtSettings,
                         IMediator mediator,
                         RoleManager<IdentityRole<Guid>> roleManager,
                         IRefreshTokenRepository refreshTokenRepository) : base(notificador)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtSettings = jwtSettings.Value;
            _mediator = mediator;
            _roleManager = roleManager;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<(Result Result, string Data)> GenerateJwtTokenAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.ValidAt,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_jwtSettings.ExpirationTime),
                signingCredentials: creds
            );

            var encodedToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Successful<string>(encodedToken);
        }

		public async Task<(Result Result, List<UserSummary> data)> GetListUserAsync()
		{
			var userList = _userManager.Users.ToList();
			var userSummaries = new List<UserSummary>();

			foreach (var u in userList)
			{
				var roles = await _userManager.GetRolesAsync(u);
				userSummaries.Add(new UserSummary
				{
					Id = u.Id,
					FullName = u.FullName,
					Email = u.Email,
					IsActive = u.IsActive,
					Roles = roles.ToList()
				});
			}

			return Successful(userSummaries);
		}

        public async Task<(Result Result, AuthResult Data)> LoginUserAsync(LoginUserView loginUserView)
        {
            var result = await _signInManager.PasswordSignInAsync(loginUserView.Email, loginUserView.Password, false, true);
            if (result.Succeeded)
            {
                var user = await _userManager.FindByEmailAsync(loginUserView.Email);
                if (user == null)
                    return Unsuccessful<AuthResult>(Errors.UserNotFound);

                if(user.IsActive is false)
                    return Unsuccessful<AuthResult>(Errors.UserInactive);

				var newRefreshToken = Guid.NewGuid();
                await _mediator.Publish(new SaveRefreshTokenEvent(newRefreshToken, user.Id));

				var jwt = await GenerateJwtTokenAsync(user);
				var roles = await _userManager.GetRolesAsync(user);
				var userView = new UserView { Id = user.Id, Email = user.Email, Name = user.FullName, IsActive = user.IsActive, Roles = roles.ToList() };

                return Successful(new AuthResult { Jwt = jwt.Data, RefreshToken = newRefreshToken, UserView = userView });
            }

            if (result.IsLockedOut)
            {
                return Unsuccessful<AuthResult>(Errors.UserTemporarilyBlocked);
            }

            return Unsuccessful<AuthResult>(Errors.IncorrectUsernamePassword);
        }

		public async Task<(Result Result, AuthResult Data)> RegisterUserAsync(RegisterUserView registerUserView)
		{
            var user = new User(registerUserView.FullName, registerUserView.Email);

            var result = await _userManager.CreateAsync(user, registerUserView.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, false);

                var newRefreshToken = Guid.NewGuid();
                await _mediator.Publish(new SaveRefreshTokenEvent(newRefreshToken, user.Id));

                var jwt = await GenerateJwtTokenAsync(user);

			var roles = await _userManager.GetRolesAsync(user);
				var userView = new UserView
				{
					Id = user.Id,
					Email = user.Email,
					Name = user.FullName,
					IsActive = user.IsActive,
					Roles = roles.ToList()
				};

                return Successful(new AuthResult { Jwt = jwt.Data, RefreshToken = newRefreshToken, UserView = userView });
            }

            foreach (var error in result.Errors)
            {
                Notify(error.Description);
            }
            return Unsuccessful<AuthResult>();
        }

        public async Task<Result> InactiveUser(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return Unsuccessful(Errors.UserNotFound);

            user.InactiveUser();

            await _userManager.SetTwoFactorEnabledAsync(user, true);
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                    Notify(error.Description);
                return Unsuccessful();
            }

            return Successful();
        }

        public async Task<Result> ActiveUser(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return Unsuccessful(Errors.UserNotFound);

            user.ActiveUser();

            await _userManager.SetTwoFactorEnabledAsync(user, true);
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow);

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                    Notify(error.Description);
                return Unsuccessful();
            }

            return Successful();
        }

        public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());

            if (user == null)
                return Unsuccessful(Errors.UserNotFound);

            if (request.OldPassword.Equals(request.NewPassword))
                return Unsuccessful(Errors.PasswordCannotBeEqual);

            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    Notify(error.Description);

                return Unsuccessful();
            }

            return Successful();
        }

        public async Task<Result> UpdateEmailAsync(Guid userId, UpdateEmailRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return Unsuccessful(Errors.UserNotFound);

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
                return Unsuccessful(Errors.IncorrectUsernamePassword);

            user.Email = request.NewEmail;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    Notify(error.Description);

                return Unsuccessful();
            }

            return Successful();

		}

		public async Task<Result> UpdateUserRolesAsync(AssignRolesRequest request)
		{
			var user = await _userManager.FindByIdAsync(request.UserId.ToString());

			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			var currentRoles = await _userManager.GetRolesAsync(user);
			var requestedRoles = request.Roles.Select(r => r.ToString()).Distinct().ToList();
			var rolesToAdd = requestedRoles.Except(currentRoles).ToList();
			var rolesToRemove = currentRoles.Except(requestedRoles).ToList();

			if (!rolesToAdd.Any() && !rolesToRemove.Any())
				return Unsuccessful(Errors.PermissionListCannotBeEmpty);

			if (rolesToRemove.Any())
			{
				var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
				if (!removeResult.Succeeded)
				{
					foreach (var error in removeResult.Errors)
						Notify(error.Description);
					return Unsuccessful();
				}
			}

			if (rolesToAdd.Any())
			{
				var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);

				if (!addResult.Succeeded)
				{
					foreach (var error in addResult.Errors)
						Notify(error.Description);
					return Unsuccessful();
				}
			}

			return Successful();
		}

		
		public async Task<(Result Result, string Data)> GenerateJwtTokenAsync(Guid userId)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful<string>(Errors.UserNotFound);

            var tokenResult = await GenerateJwtTokenAsync(user);
            if (!tokenResult.Result.Success)
                return Unsuccessful<string>();

            return Successful(tokenResult.Data);
        }

        public async Task<bool> ExistsUser(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return false;

            return true;
        }
                
        public async Task<Result> LogoutAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return Unsuccessful(Errors.UserNotFound);

            await _signInManager.SignOutAsync();

            var activeTokens = await _refreshTokenRepository.GetByUserIdAsync(userId);

            if (activeTokens != null && activeTokens.Any())
            {
                foreach (var token in activeTokens)
                {
                    token.Revoke();

                    _refreshTokenRepository.Update(token);
                }

                if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
                    return Unsuccessful(Errors.ErrorSavingDatabase);
            }

            return Successful();
        }

        public async Task<(Result Result, UserView Data)> GetMeAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return Unsuccessful<UserView>(Errors.UserNotFound);

            var roles = await _userManager.GetRolesAsync(user);
            var userView = new UserView
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.FullName,
                IsActive = user.IsActive,
                Roles = roles.ToList()
            };

            return Successful(userView);
        }

    }
}