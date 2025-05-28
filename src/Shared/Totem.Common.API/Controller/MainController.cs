using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Totem.Common.Domain.Notification;
using Totem.Common.Services;

namespace Totem.Common.API.Controller
{
    [Authorize]
    [ApiController]
    public abstract class MainController : ControllerBase
    {
        private readonly INotificator _notificador;
		protected MainController(INotificator notificador)
        {
			_notificador = notificador;
		}

        protected ActionResult CustomResponse<T>((Result Result, T Data) response)
        {
            if (!response.Result.HasNotifications())
            {
                return Ok(new
                {
                    success = true,
                    data = response.Data
                });
            }

            return BadRequest(new
            {
                success = false,
                errors = response.Result.GetNotifications().Select(n => n.Message)
            });
        }



        protected ActionResult CustomResponse(Result result)
        {
            if (!result.HasNotifications())
            {
                return Ok(new
                {
                    success = true,
                    data = result
                });
            }

            var notifications = result.GetNotifications();
            return BadRequest(new
            {
                success = false,
                errors = notifications.Select(n => n.Message)
            });
        }


        protected ActionResult CustomResponse(ModelStateDictionary modelState)
        {
            if (!modelState.IsValid) NotificarErroModelInvalida(modelState);
            return CustomResponse(modelState);
        }

        protected void NotificarErroModelInvalida(ModelStateDictionary modelState)
        {
            var erros = modelState.Values.SelectMany(e => e.Errors);
            foreach (var erro in erros)
            {
                var errorMsg = erro.Exception == null ? erro.ErrorMessage : erro.Exception.Message;
                NotifyError(errorMsg);
            }
        }

        protected void NotifyError(string message)
        {
            _notificador.Handle(new Notification(message));
        }
    }
}
