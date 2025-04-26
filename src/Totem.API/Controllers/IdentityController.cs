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
        [HttpPost("new-account")]
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
    }
}
