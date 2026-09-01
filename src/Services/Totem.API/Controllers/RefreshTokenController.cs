using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.RefreshTokenServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class RefreshTokenController : MainController
    {
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IWebHostEnvironment _environment;

        public RefreshTokenController(INotificator notificador, IRefreshTokenService refreshTokenService, IWebHostEnvironment environment) : base(notificador)
        {
            _refreshTokenService = refreshTokenService;
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var userIdCookie = Request.Cookies["user_id"];
            var refreshTokenCookie = Request.Cookies["refresh_token"];

            if (string.IsNullOrWhiteSpace(userIdCookie) || !Guid.TryParse(userIdCookie, out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(refreshTokenCookie) || !Guid.TryParse(refreshTokenCookie, out var tokenId))
                return Unauthorized();

            var result = await _refreshTokenService.RefreshTokenAsync(userId, tokenId);

            if (!result.result.Success) return CustomResponse(result.result);

            // Fora de Development os cookies de sessao so trafegam sobre HTTPS.
            var secure = !_environment.IsDevelopment();

            Response.Cookies.Append("access_token", result.data.Jwt, new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });
            Response.Cookies.Append("refresh_token", result.data.RefreshToken.ToString(), new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return CustomResponse((result.result, result.data.UserView));
        }
    }
}
