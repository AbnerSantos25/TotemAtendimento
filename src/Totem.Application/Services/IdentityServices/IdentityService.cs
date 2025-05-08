using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Totem.Common.Domain.Notification;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
	public class IdentityService : BaseService, IIdentityService
	{
		private readonly JwtSettings _jwtSettings;
		private readonly SignInManager<IdentityUser> _signInManager;
		private readonly UserManager<IdentityUser> _userManager;

		public IdentityService(INotificador notificador, UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IOptions<JwtSettings> jwtSettings) : base(notificador)
		{
			_userManager = userManager;
			_signInManager = signInManager;
			_jwtSettings = jwtSettings.Value;
		}

		public async Task<(Result Result, string Data)> GenerateJwtTokenAsync()
		{
			var Key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
			var token = tokenHandler.CreateToken(new SecurityTokenDescriptor
			{
				Issuer = _jwtSettings.Issuer,
				Audience = _jwtSettings.ValidAt,
				Expires = DateTime.UtcNow.AddHours(_jwtSettings.ExpirationTime),
				SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			});

			var encodedToken = tokenHandler.WriteToken(token);

			return Successful<string>(encodedToken);
		}

		public async Task<(Result Result, string Data)> LoginUserAsync(LoginUserView loginUserView)
		{
			var result = await _signInManager.PasswordSignInAsync(loginUserView.Email, loginUserView.Password, false, true);
			if (result.Succeeded)
			{
				return await GenerateJwtTokenAsync();
			}

			if (result.IsLockedOut)
			{
				return Unsuccessful<string>(Errors.UserTemporarilyBlocked);
			}

			return Unsuccessful<string>(Errors.IncorrectUsernamePassword);
		}

		public async Task<(Result Result, string Data)> RegisterUserAsync(RegisterUserView registerUserView)
		{
			var user = new IdentityUser
			{
				UserName = registerUserView.Email,
				Email = registerUserView.Email,
				EmailConfirmed = true
			};

			var result = await _userManager.CreateAsync(user, registerUserView.Password);
			if (result.Succeeded)
			{
				await _signInManager.SignInAsync(user, false);
				return await GenerateJwtTokenAsync();
			}

			foreach (var error in result.Errors)
			{
				Notificar(error.Description);
			}

			return Unsuccessful<string>();
		}

		public async Task<Result> InactiveUser(Guid userId)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			await _userManager.SetTwoFactorEnabledAsync(user, true);
			await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

			return Successful();
		}

		public async Task<Result> ActiveUser(Guid userId)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			await _userManager.SetTwoFactorEnabledAsync(user, true);
			await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow);

			return Successful();
		}

		public async Task<Result> UpdatePasswordAsync(Guid id, UpdatePasswordRequest request)
		{
			var user = await _userManager.FindByIdAsync(id.ToString());

			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

			if (!result.Succeeded)
			{
				foreach (var error in result.Errors)
					Notificar(error.Description);

				return Unsuccessful();
			}

			return Successful();
		}

	}
}
