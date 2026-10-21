using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Totem.Common.API.Filters
{
    /// <summary>
    /// Responde 400 no formato padrao da API ({ success = false, errors = [...] }), igual ao MainController.CustomResponse,
    /// quando o ModelState chega invalido por erro de binding (JSON malformado, tipo errado). Os DTOs nao tem atributos
    /// de validacao: as regras de entrada ficam nos Contracts chamados pelos services (Totem.Common.Validation).
    /// Substitui a validacao automatica do [ApiController], desligada em ApiConfiguration
    /// para a API ter um unico formato de erro.
    /// </summary>
    public class ModelStateValidationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.ModelState.IsValid) return;

            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.Exception == null ? e.ErrorMessage : e.Exception.Message);

            context.Result = new BadRequestObjectResult(new { success = false, errors });
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}
