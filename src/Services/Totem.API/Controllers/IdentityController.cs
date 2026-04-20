using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
        public IdentityController(INotificator notificator, IIdentityService identityService) : base(notificator)
        {
            _identityService = identityService;
        }

        [HttpPost("register")]
        [EnableRateLimiting("Auth")]
        public async Task<ActionResult> Register(RegisterUserView registerUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            var result = await _identityService.RegisterUserAsync(registerUser);
            if (!result.Result.Success) return CustomResponse(result.Result);

            SetAuthCookies(result.Data.Jwt, result.Data.RefreshToken, result.Data.UserView.Id!.Value);
            return CustomResponse((result.Result, result.Data.UserView));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [EnableRateLimiting("Auth")]
        public async Task<ActionResult> Login(LoginUserView loginUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            var result = await _identityService.LoginUserAsync(loginUser);
            if (!result.Result.Success) return CustomResponse(result.Result);

            SetAuthCookies(result.Data.Jwt, result.Data.RefreshToken, result.Data.UserView.Id!.Value);
            return CustomResponse((result.Result, result.Data.UserView));
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

        [HttpGet("users")]
        public async Task<ActionResult> GetListUser()
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _identityService.GetListUserAsync());
		}
  
        [HttpPut("user/{userId}/update-email")]
        public async Task<ActionResult> UpdateEmail([FromRoute] Guid userId, [FromBody] UpdateEmailRequest request)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _identityService.UpdateEmailAsync(userId, request));
        }

		[HttpPatch("user/{userId}/inactivate")]
        public async Task<ActionResult> InactivateUser([FromRoute] Guid userId)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _identityService.InactiveUser(userId));
		}

		[HttpPatch("user/{userId}/active")]
        public async Task<ActionResult> ActiveUser([FromRoute] Guid userId)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _identityService.ActiveUser(userId));
        }

        [Authorize(Roles = nameof(Role.Admin))]
        [HttpPost("assign-roles")]
        public async Task<ActionResult> UpdateUserRolesAsync([FromBody] AssignRolesRequest request)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

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

		[HttpPost("user/{userId}/change-password")]
        [EnableRateLimiting("Mutation")]
		public async Task<ActionResult> ChangePassword([FromRoute] Guid userId, [FromBody] ChangePasswordRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _identityService.ChangePasswordAsync(userId, request));
		}

        private void SetAuthCookies(string jwt, Guid refreshToken, Guid userId)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            };

            var refreshOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/api/totem/RefreshToken"
            };

            var userIdOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
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
