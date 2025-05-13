using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.IdentityServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Domain.Models.IdentityModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class IdentityController : MainController
    {
        private readonly IIdentityService _identityService;
        public IdentityController(INotificador notificador, IIdentityService identityService) : base(notificador)
        {
            _identityService = identityService;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult> Registrar(RegisterUserView registerUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _identityService.RegisterUserAsync(registerUser));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginUserView loginUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _identityService.LoginUserAsync(loginUser));
        }

        [HttpPut("user/{id}/update-password")]
        public async Task<ActionResult> UpdatePassword([FromRoute] Guid id, [FromBody] UpdatePasswordRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);
			return CustomResponse(await _identityService.UpdatePasswordAsync(id, request));
		}

        [HttpPut("user/{id}/update-email")]
		public async Task<ActionResult> UpdateEmail([FromRoute] Guid id, [FromBody] UpdateEmailRequest request)
        {
			if (!ModelState.IsValid) return CustomResponse(ModelState);
			return CustomResponse(await _identityService.UpdateEmailAsync(id, request));
		}


		[HttpPatch("user/{id}/inactivate")]
        public async Task<ActionResult> InactivateUser([FromRoute] Guid id)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _identityService.InactiveUser(id));
		}
		[HttpPatch("user/{id}/active")]
		public async Task<ActionResult> ActiveUser([FromRoute] Guid id)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _identityService.ActiveUser(id));
		}
	}
}
