using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.PasswordServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Services;
using Totem.Domain.Models.PasswordModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class PasswordController : MainController
    {
        private readonly IPasswordService _passwordService;
        public PasswordController(INotificador notificador, IPasswordService passwordService) : base(notificador)
        {
            _passwordService = passwordService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPasswordById(Guid id) {

            if(!ModelState.IsValid) return CustomResponse(ModelState);

            var result = await _passwordService.GetByIdPasswordAsync(id);
            return CreateResponse((result.result, result.data));
        }


        //[HttpGet]
        //public async Task<IActionResult> GetPasswords()
        //{
        //    if (!ModelState.IsValid) return CustomResponse(ModelState);
        //    return CustomResponse(await _passwordService.GetListPasswordAsync());
        //}

        //[HttpPost]
        //public async Task<IActionResult> AddPassword([FromBody] PasswordRequest request)
        //{
        //    if (!ModelState.IsValid) return CustomResponse(ModelState);
        //    return CustomResponse(await _passwordService.AddPasswordAsync(request));
        //}

        //[HttpDelete]
        //public async Task<IActionResult> RemovePassword(Guid id)
        //{
        //    if (!ModelState.IsValid) return CustomResponse(ModelState);
        //    return CustomResponse(await _passwordService.RemovePasswordAsync(id));
        //}
    }
}
