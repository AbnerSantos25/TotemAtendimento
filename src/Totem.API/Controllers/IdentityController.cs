using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Totem.Application.Services.IdentityServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Extension;
using Totem.Domain.Models.IdentityModels;

namespace Totem.API.Controllers
{
    public class IdentityController : MainController
    {
        private readonly IIdentityService _identityService;
        public IdentityController(INotificador notificador, IIdentityService identityService) : base(notificador)
        {
            _identityService = identityService;
        }

        [HttpPost("nova-conta")]
        public async Task<ActionResult> Registrar(RegisterUserView registerUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _identityService.RegisterUserAsync(registerUser));
        }

        [HttpPost("entrar")]
        public async Task<ActionResult> Login(LoginUserView loginUser)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _identityService.LoginUserAsync(loginUser));
        }
    }
}
