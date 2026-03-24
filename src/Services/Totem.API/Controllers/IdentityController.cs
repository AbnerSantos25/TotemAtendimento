using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult> Register(RegisterUserView registerUser)
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

        [HttpGet("users")]
        public async Task<ActionResult> GetListUser()
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _identityService.GetListUserAsync());
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

		[Authorize(Roles = nameof(EnumRoles.Admin))]
		[HttpPost("assign-role")]
		public async Task<ActionResult> AssignRole([FromBody] AssignRoleRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			var result = await _identityService.AddUserToRoleAsync(request);

			return CustomResponse(result);
		}

	}
}
