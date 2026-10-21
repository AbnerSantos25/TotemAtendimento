using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Totem.Common.API.Filters;
using Totem.Common.Domain.Notification;

namespace Totem.Common.API.Controller
{
    [Authorize]
    [ApiController]
    [ValidateCookieAntiforgery]
    [EnableRateLimiting("Global")]
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


        /// <summary>Responde com as notificacoes registradas por <see cref="NotifyError"/>.</summary>
        protected ActionResult CustomResponse()
        {
            var result = new Result();
            result.Handle(_notificador.GetNotifications());

            return CustomResponse(result);
        }

        protected void NotifyError(string message)
        {
            _notificador.Handle(new Notification(message));
        }
    }
}
