using Microsoft.AspNetCore.Antiforgery;
using Totem.Common.API.Filters;
using Totem.Common.Localization.Resources;

namespace Totem.API.Configuration
{
    public static class ApiConfiguration
    {
        public static IServiceCollection AddApiConfiguration(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            // As regras de entrada ficam nos Contracts dos services (docs/validacao.md). Erro de binding (JSON malformado,
            // tipo errado) passa pelo ModelStateValidationFilter, no formato padrao da API; a resposta automatica do
            // [ApiController] fica desligada. Sem o Suppress, o MVC trata string nao anulavel como [Required] e
            // responde "The X field is required." em ingles antes de o Contract rodar.
            services.AddControllers(options =>
                {
                    options.Filters.Add<ModelStateValidationFilter>();
                    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
                })
                .ConfigureApiBehaviorOptions(options => options.SuppressModelStateInvalidFilter = true);

            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-XSRF-TOKEN";
            });

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();
                    if (allowedOrigins == null || allowedOrigins.Length == 0)
                        throw new InvalidOperationException(Errors.CorsAllowedOriginsNotConfigured);

                    var isWildcard = allowedOrigins.Length == 1 && allowedOrigins[0] == "*";

                    // A politica usa AllowCredentials, entao aceitar qualquer origem
                    // exporia a sessao de qualquer site. O curinga fica restrito a Development.
                    if (isWildcard && !environment.IsDevelopment())
                        throw new InvalidOperationException(Errors.CorsWildcardNotAllowed);

                    if (isWildcard)
                    {
                        policy.SetIsOriginAllowed(_ => true)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                    else
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                });
            });

            return services;
        }

        public static IApplicationBuilder UseCsrfMiddleware(this IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
                var tokens = antiforgery.GetAndStoreTokens(context);
                
                context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, 
                    new CookieOptions { 
                        HttpOnly = false, 
                        Secure = true, 
                        SameSite = SameSiteMode.Lax 
                    });

                await next(context);
            });

            return app;
        }
    }
}
