using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using System.Net;

namespace Totem.IntegrationTests.Infrastructure;

/// <summary>
/// O TestServer nao preenche Connection.RemoteIpAddress. Como a particao do rate
/// limiter e <c>RemoteIpAddress?.ToString() ?? TraceIdentifier</c>, e o
/// TraceIdentifier e unico por requisicao, cada chamada cairia na sua propria
/// particao e o limite nunca seria atingido.
///
/// Este filtro roda no inicio do pipeline -- antes do UseRateLimiter -- e define o
/// IP de origem a partir do cabecalho <c>X-Test-Client-Ip</c>, permitindo que cada
/// teste use o seu proprio IP e portanto a sua propria particao, sem depender da
/// ordem de execucao.
/// </summary>
internal sealed class TestClientIpStartupFilter : IStartupFilter
{
    internal const string HeaderName = "X-Test-Client-Ip";

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
    {
        app.Use((context, nextMiddleware) =>
        {
            var header = context.Request.Headers[HeaderName].ToString();

            context.Connection.RemoteIpAddress = IPAddress.TryParse(header, out var address)
                ? address
                : IPAddress.Loopback;

            return nextMiddleware();
        });

        next(app);
    };
}
