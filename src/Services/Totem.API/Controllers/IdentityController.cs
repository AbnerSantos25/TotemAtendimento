using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Totem.Common.Extension;
using System.Security.Claims;
using Totem.Application.Services.IdentityServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Domain.Models.IdentityModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
	public class IdentityController : MainController
    {

        private readonly IIdentityService _identityService;
        private readonly IWebHostEnvironment _environment;
        private readonly JwtSettings _jwtSettings;
        public IdentityController(INotificator notificator, IIdentityService identityService, IWebHostEnvironment environment, IOptions<JwtSettings> jwtSettings) : base(notificator)
        {
            _identityService = identityService;
            _environment = environment;
            _jwtSettings = jwtSettings.Value;
        }

		[Authorize(Roles = $"{nameof(Role.Manager)}")]
		[HttpPost("register")]
		[EnableRateLimiting("Auth")]
		public async Task<ActionResult> Register(RegisterUserView registerUser)
		{
			var result = await _identityService.RegisterUserAsync(registerUser);
			if (!result.Result.Success) return CustomResponse(result.Result);

			return CustomResponse((result.Result, result.Data));
		}

		[AllowAnonymous]
        [HttpPost("login")]
        [EnableRateLimiting("Auth")]
        public async Task<ActionResult> Login(LoginUserView loginUser)
        {
            var result = await _identityService.LoginUserAsync(loginUser);
            if (!result.Result.Success) return CustomResponse(result.Result);

            SetAuthCookies(result.Data.Jwt, result.Data.RefreshToken, result.Data.UserView.Id!.Value);
            return CustomResponse((result.Result, result.Data));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult> GetMe()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                              ?? User.FindFirstValue("sub");

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            return CustomResponse(await _identityService.GetMeAsync(userId));
        }

        [Authorize(Roles = nameof(Role.Manager))]
        [HttpGet("users")]
        public async Task<ActionResult> GetListUser()
        {
            return CustomResponse(await _identityService.GetListUserAsync());
		}

		[EnableRateLimiting("Auth")]
		[HttpPut("user/update-email")]
        public async Task<ActionResult> UpdateEmail([FromBody] UpdateEmailRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                              ?? User.FindFirstValue("sub");

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            return CustomResponse(await _identityService.UpdateEmailAsync(userId, request));
        }

		[Authorize(Roles = nameof(Role.Manager))]
		[HttpPatch("user/{userId}/inactivate")]
        public async Task<ActionResult> InactivateUser([FromRoute] Guid userId)
        {
            return CustomResponse(await _identityService.InactiveUser(userId, User.IsInRole(nameof(Role.Admin))));
		}

		[Authorize(Roles = nameof(Role.Manager))]
		[HttpPatch("user/{userId}/active")]
        public async Task<ActionResult> ActiveUser([FromRoute] Guid userId)
        {
            return CustomResponse(await _identityService.ActiveUser(userId, User.IsInRole(nameof(Role.Admin))));
        }

        [Authorize(Roles = $"{nameof(Role.Manager)}")]
        [HttpPost("assign-roles")]
        public async Task<ActionResult> UpdateUserRolesAsync([FromBody] AssignRolesRequest request)
        {
            var result = await _identityService.UpdateUserRolesAsync(request);

            return CustomResponse(result);
        }

        [HttpPost("logout/{userId}")]
        public async Task<ActionResult> Logout(Guid userId)
        {
            var result = await _identityService.LogoutAsync(userId);

            ClearAuthCookies();

            return CustomResponse(result);
        }

		[Authorize(Roles = $"{nameof(Role.User)},{nameof(Role.Manager)}")]
		[HttpPost("user/{userId}/change-password")]
        [EnableRateLimiting("Mutation")]
		public async Task<ActionResult> ChangePassword([FromRoute] Guid userId, [FromBody] ChangePasswordRequest request)
		{
			return CustomResponse(await _identityService.ChangePasswordAsync(userId, request));
		}

        [Authorize(Roles = nameof(Role.Manager))]
        [HttpGet("user/{userId}/queue-permissions")]
        public async Task<ActionResult> GetUserQueuePermissions([FromRoute] Guid userId, [FromServices] IUserQueuePermissionService permissionService)
        {
            return CustomResponse(await permissionService.GetAllowedQueueIdsAsync(userId));
        }

		[Authorize(Roles = nameof(Role.Manager))]
		[HttpPut("user/{userId}/queue-permissions")]
        public async Task<ActionResult> SetUserQueuePermissions([FromRoute] Guid userId, [FromBody] SetUserQueuePermissionsRequest request, [FromServices] IUserQueuePermissionService permissionService)
        {
            return CustomResponse(await permissionService.SetPermissionsAsync(userId, request));
        }

        private void SetAuthCookies(string jwt, Guid refreshToken, Guid userId)
        {
            // Fora de Development os cookies de sessao so trafegam sobre HTTPS.
            var secure = !_environment.IsDevelopment();

            // Os cookies de renovacao acompanham o prazo do refresh token: um cookie
            // que sobrevive ao token so produz 401 depois de o usuario achar que segue logado.
            var sessionExpiry = DateTimeOffset.UtcNow.AddHours(_jwtSettings.RefreshTokenExpirationHours);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            };

            var refreshOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = sessionExpiry,
                Path = "/api/totem/RefreshToken"
            };

            var userIdOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = sessionExpiry
            };

            Response.Cookies.Append("access_token", jwt, cookieOptions);
            Response.Cookies.Append("refresh_token", refreshToken.ToString(), refreshOptions);
            Response.Cookies.Append("user_id", userId.ToString(), userIdOptions);
        }

        private void ClearAuthCookies()
        {
            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
            Response.Cookies.Delete("user_id");
        }
	}
}
