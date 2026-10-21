using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Totem.Application.Services.PasswordServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Domain.Models.PasswordModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class PasswordController : MainController
    {
        private readonly IPasswordService _passwordService;
        public PasswordController(INotificator notificator, IPasswordService passwordService) : base(notificator)
        {
            _passwordService = passwordService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPasswordById(Guid id)
        {
            return CustomResponse(await _passwordService.GetByIdPasswordAsync(id));
        }

        [HttpGet]
		public async Task<IActionResult> GetPasswords([FromQuery] Guid queueId)
        {
            return CustomResponse(await _passwordService.GetListPasswordAsync(queueId));
        }

        [HttpPost]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> AddPassword([FromBody] PasswordRequest request)
        {
            var response = await _passwordService.AddPasswordAsync(request);
            return CustomResponse(response);
        }

        [HttpPost("{passwordId}/transfer")]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> Transfer([FromRoute] Guid passwordId, [FromBody] PasswordTransferRequest request)
        {
            return CustomResponse(await _passwordService.TransferPasswordAsync(passwordId, request));
        }

        [HttpPatch("{passwordId}/MarkAsServed")]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> MarkAsServedAsync([FromRoute] Guid passwordId)
        {
            return CustomResponse(await _passwordService.MarkAsServed(passwordId));
        }

		[Authorize(Roles = $"{nameof(Role.Manager)}")]
		[HttpDelete]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> RemovePassword(Guid id)
        {
            return CustomResponse(await _passwordService.RemovePasswordAsync(id));
        }

		[Authorize(Roles = $"{nameof(Role.System)}")]
		[EnableRateLimiting("Global")]
        [HttpGet("latest-calls")]
		public async Task<IActionResult> GetLatestCalls()
		{
			return CustomResponse(await _passwordService.GetLatestCallsAsync());
		}
	}
}
