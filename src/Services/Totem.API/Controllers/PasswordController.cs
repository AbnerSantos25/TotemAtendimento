using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.PasswordServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
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

            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _passwordService.GetByIdPasswordAsync(id));
        }


        [HttpGet]
        public async Task<IActionResult> GetPasswords()
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _passwordService.GetListPasswordAsync());
        }


        [HttpPost]
        public async Task<IActionResult> AddPassword([FromBody] PasswordRequest request)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            var teste = await _passwordService.AddPasswordAsync(request);
            return CustomResponse(teste);
        }

        [HttpPost("{passwordId}/transfer")]
        public async Task<IActionResult> Transfer([FromRoute] Guid passwordId, [FromBody] PasswordTransferRequest request)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);

            return CustomResponse(await _passwordService.TransferPasswordAsync(passwordId, request));
        }

        [HttpPatch("{passwordId}/MarkAsServed")]
        public async Task<IActionResult> MarkAsServedAsync([FromRoute] Guid passwordId)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _passwordService.MarkAsServed(passwordId));
        }
        [HttpDelete]
        public async Task<IActionResult> RemovePassword(Guid id)
        {
            if (!ModelState.IsValid) return CustomResponse(ModelState);
            return CustomResponse(await _passwordService.RemovePasswordAsync(id));
        }
    }
}
