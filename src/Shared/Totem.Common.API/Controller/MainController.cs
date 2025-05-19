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
        private readonly INotificador _notificador;
		protected MainController(INotificador notificador)
        {
			_notificador = notificador;
		}

        protected ActionResult CustomResponse<T>((Result Result, T Data) response)
        {
            if (!response.Result.TemNotificacao())
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
                errors = response.Result.ObterNotificacoes().Select(n => n.Mensagem)
            });
        }



        protected ActionResult CustomResponse(Result result)
        {
            if (!result.TemNotificacao())
            {
                return Ok(new
                {
                    success = true,
                    data = result
                });
            }

            var notifications = result.ObterNotificacoes();
            return BadRequest(new
            {
                success = false,
                errors = notifications.Select(n => n.Mensagem)
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
                NotificarErro(errorMsg);
            }
        }

        protected void NotificarErro(string mensagem)
        {
            _notificador.Handle(new Notificacao(mensagem));
        }
    }
}
