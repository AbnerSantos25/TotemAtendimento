﻿using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.RefreshTokenAggregate.Events;
using Totem.Domain.Models.IdentityModels;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.IdentityServices
{
	public class IdentityService : BaseService, IIdentityService, IIdentityIntegrationService
	{
		private readonly JwtSettings _jwtSettings;
		private readonly SignInManager<IdentityUser> _signInManager;
		private readonly UserManager<IdentityUser> _userManager;
		private readonly IMediator _mediator;


		public IdentityService(INotificator notificador, UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IOptions<JwtSettings> jwtSettings, IMediator mediator) : base(notificador)
		{
			_userManager = userManager;
			_signInManager = signInManager;
			_jwtSettings = jwtSettings.Value;
			_mediator = mediator;
		}

		public async Task<(Result Result, string Data)> GenerateJwtTokenAsync(IdentityUser user)
		{
			var roles = await _userManager.GetRolesAsync(user);

			var claims = new List<Claim>
			{
				new Claim(JwtRegisteredClaimNames.Sub, user.Id),
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

		public async Task<(Result Result, JwtAndTokenView Data)> LoginUserAsync(LoginUserView loginUserView)
		{
			var result = await _signInManager.PasswordSignInAsync(loginUserView.Email, loginUserView.Password, false, true);
			if (result.Succeeded)
			{
				var user = await _userManager.FindByEmailAsync(loginUserView.Email);
				if (user == null)
					return Unsuccessful<JwtAndTokenView>(Errors.UserNotFound);

				var newRefreshToken = Guid.NewGuid();
				await _mediator.Publish(new SaveRefreshTokenEvent(newRefreshToken, user.Id));

				var jwt = await GenerateJwtTokenAsync(user);
				return Successful(new JwtAndTokenView { JWT = jwt.Data, NewToken = newRefreshToken });
			}

			if (result.IsLockedOut)
			{
				return Unsuccessful<JwtAndTokenView>(Errors.UserTemporarilyBlocked);
			}

			return Unsuccessful<JwtAndTokenView>(Errors.IncorrectUsernamePassword);
		}

		public async Task<(Result Result, JwtAndTokenView Data)> RegisterUserAsync(RegisterUserView registerUserView)
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

				var newRefreshToken = Guid.NewGuid();
				await _mediator.Publish(new SaveRefreshTokenEvent(newRefreshToken, user.Id));

				var jwt = await GenerateJwtTokenAsync(user);

				return Successful(new JwtAndTokenView { JWT = jwt.Data, NewToken = newRefreshToken });
			}

			foreach (var error in result.Errors)
			{
				Notify(error.Description);
			}
			return Unsuccessful<JwtAndTokenView>();
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
					Notify(error.Description);

				return Unsuccessful();
			}

			return Successful();
		}

		public async Task<Result> UpdateEmailAsync(Guid id, UpdateEmailRequest request)
		{
			var user = await _userManager.FindByIdAsync(id.ToString());
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

		public async Task<Result> AddUserToRoleAsync(Guid userId, EnumRoles role)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			var roles = await _userManager.GetRolesAsync(user);
			if (roles.Contains(role.ToString()))
				return Unsuccessful(Errors.UserAlreadyHasRole);

			var result = await _userManager.AddToRoleAsync(user, role.ToString());

			if (!result.Succeeded)
			{
				foreach (var error in result.Errors)
					Notify(error.Description);

				return Unsuccessful();
			}

			return Successful();
		}

		public async Task<Result> RemoveUserFromRoleAsync(Guid userId, EnumRoles role)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful(Errors.UserNotFound);

			var roles = await _userManager.GetRolesAsync(user);
			if (!roles.Contains(role.ToString()))
				return Unsuccessful(Errors.UserAlreadyHasRole);

			var result = await _userManager.RemoveFromRoleAsync(user, role.ToString());

			if (!result.Succeeded)
			{
				foreach (var error in result.Errors)
					Notify(error.Description);

				return Unsuccessful();
			}

			return Successful();
		}


		public async Task<(Result Result, string Data)> GenerateJwtTokenAsync(string userId)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return Unsuccessful<string>(Errors.UserNotFound);

			var tokenResult = await GenerateJwtTokenAsync(user);
			if (!tokenResult.Result.Success)
				return Unsuccessful<string>();

			return Successful(tokenResult.Data);
		}
		public async Task<bool> ExistsUser(string userId)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return false;

			return true;
		}
	}
}