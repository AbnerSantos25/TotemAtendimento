using Microsoft.AspNetCore.Antiforgery;
using Totem.Common.Localization.Resources;

namespace Totem.API.Configuration
{
    public static class ApiConfiguration
    {
        public static IServiceCollection AddApiConfiguration(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new Totem.Common.Security.HtmlSanitizerStringConverter());
                });

            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-XSRF-TOKEN";
            });

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    if (environment.IsDevelopment())
                    {
                        var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();
                        if (allowedOrigins == null || allowedOrigins.Length == 0)
                            throw new InvalidOperationException(Errors.CorsAllowedOriginsNotConfigured);

                        // Only during development.
                        if (allowedOrigins.Length == 1 && allowedOrigins[0] == "*")
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
                    }
                    else
                    {
                        policy.WithOrigins("https://seusiteoficial.com")
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
