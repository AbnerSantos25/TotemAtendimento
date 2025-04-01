using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Common.Domain.Notification;

namespace Totem.Common.API.Controller
{
	[ApiController]
	public abstract class MainController : ControllerBase
	{
		private readonly INotificador _notificador;

		protected MainController(INotificador notificador)
		{
			_notificador = notificador;
		}

		protected ActionResult CustomResponse(object result = null)
		{

			if (OperacaoValida())
			{
				return Ok(new
				{
					success = true,
					data = result
				});
			}

			var notifications = _notificador.ObterNotificacoes();
			return BadRequest(new { success = false, errors = notifications });
		}

		protected ActionResult CustomResponse(ModelStateDictionary modelState)
		{
			if (!modelState.IsValid) NotificarErroModelInvalida(modelState);
			return CustomResponse();
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

		protected bool OperacaoValida()
		{
			return !_notificador.TemNotificacao();
		}
	}
}
