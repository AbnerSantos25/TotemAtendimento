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

		public RefreshTokenController(INotificator notificador, IRefreshTokenService refreshTokenService) : base(notificador)
		{
			_refreshTokenService = refreshTokenService;
		}

		[HttpGet("/user/{userId}/RefreshToken/{tokenId}")]
		public async Task<IActionResult> SaveRefreshToken(string userId, Guid tokenId)
		{ 
			if (!ModelState.IsValid) return CustomResponse(ModelState);
			
			return CustomResponse(await _refreshTokenService.RefreshTokenAsync(userId, tokenId));
		}
	}
}
