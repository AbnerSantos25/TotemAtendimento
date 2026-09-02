using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace Totem.API.Configuration
{
    public static class RateLimitingConfiguration
    {
        /// <summary>
        /// Particao usada quando o IP de origem nao pode ser determinado. Antes o
        /// fallback era o TraceIdentifier, unico por requisicao: cada chamada caia na
        /// propria particao e o rate limiting deixava de existir em silencio, justamente
        /// na protecao de forca bruta do login. Uma chave fixa faz as requisicoes sem IP
        /// dividirem um unico balde, falhando de forma restritiva em vez de permissiva.
        /// </summary>
        private const string UnknownClientPartition = "unknown-client";

        private static string PartitionKey(HttpContext context) =>
            context.Connection.RemoteIpAddress?.ToString() ?? UnknownClientPartition;

        public static IServiceCollection AddRateLimitingConfiguration(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                
                options.OnRejected = async (context, token) =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("RateLimiting");
                    logger.LogWarning("Rate Limit excedido para o IP {Ip} no endpoint {Endpoint}.", context.HttpContext.Connection.RemoteIpAddress, context.HttpContext.Request.Path);

                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        errors = new[] { "Muitas requisições simultâneas. Por favor, aguarde alguns instantes e tente novamente." }
                    }, cancellationToken: token);
                };

                options.AddPolicy("Global", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: PartitionKey(context),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 100,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));

                options.AddPolicy("Auth", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: PartitionKey(context),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 5,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));

                options.AddPolicy("Mutation", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: PartitionKey(context),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 30,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));
            });

            return services;
        }
    }
}
