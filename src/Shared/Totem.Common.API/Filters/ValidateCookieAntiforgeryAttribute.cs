using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Totem.Common.API.Filters
{
    public class ValidateCookieAntiforgeryAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var request = context.HttpContext.Request;

            // 1. Ignorar métodos seguros (GET, HEAD, OPTIONS, TRACE)
            if (HttpMethods.IsGet(request.Method) ||
                HttpMethods.IsHead(request.Method) ||
                HttpMethods.IsOptions(request.Method) ||
                HttpMethods.IsTrace(request.Method))
            {
                await next();
                return;
            }

            // 2. Ignorar se a autenticação for via Bearer Token (Mobile)
            // Se houver o header Authorization com Bearer, pulamos a validação CSRF
            // pois o ataque CSRF só afeta autenticação automática por Cookies no Browser.
            if (request.Headers.ContainsKey("Authorization") &&
                request.Headers["Authorization"].ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            // 3. Validar Antiforgery para requisições que dependem de Cookies (Web)
            var antiforgery = context.HttpContext.RequestServices.GetRequiredService<IAntiforgery>();
            
            try
            {
                await antiforgery.ValidateRequestAsync(context.HttpContext);
            }
            catch (AntiforgeryValidationException)
            {
                context.Result = new BadRequestObjectResult(new { 
                    success = false, 
                    errors = new[] { "Falha na validação de segurança (Anti-CSRF). O token XSRF é inválido ou está ausente." } 
                });
                return;
            }

            await next();
        }
    }
}
