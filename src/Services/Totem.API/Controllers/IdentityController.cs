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

            return CustomResponse(result);
        }

		[HttpPost("user/{userId}/change-password")]
		public async Task<ActionResult> ChangePassword([FromRoute] Guid userId, [FromBody] ChangePasswordRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _identityService.ChangePasswordAsync(userId, request));
		}

	}
}
