using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Text;
using System.Text.Json;
using Totem.IntegrationTests.Infrastructure;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// O rate limiter particiona por IP de origem, entao atras de um reverse proxy o
/// X-Forwarded-For precisa ser honrado -- caso contrario todos os usuarios caem no
/// balde do proxy. Honra-lo sem restricao, porem, permitiria a qualquer cliente
/// trocar de IP a cada requisicao e anular a protecao de forca bruta do login.
///
/// Estes testes cobrem os dois lados: o cabecalho e ignorado quando vem de origem
/// nao declarada, e respeitado quando vem de um proxy configurado.
/// </summary>
public class ForwardedHeadersTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const int AuthPermitLimit = 5;

    private readonly WebApplicationFactory<Program> _factory;

    public ForwardedHeadersTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient(string clientIp, string? trustedProxy = null)
    {
        var configured = _factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");

            if (trustedProxy is not null)
                builder.UseSetting("ForwardedHeaders:KnownProxies:0", trustedProxy);

            builder.ConfigureServices(services =>
                services.AddSingleton<IStartupFilter, TestClientIpStartupFilter>());
        });

        var client = configured.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.HeaderName, clientIp);
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");

        return client;
    }

    private static StringContent LoginPayload() => new(
        JsonSerializer.Serialize(new { email = "fake@test.com", password = "WrongPass@1" }),
        Encoding.UTF8,
        "application/json");

    private static async Task<HttpResponseMessage> PostLoginAsync(HttpClient client, string? forwardedFor)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/totem/identity/login")
        {
            Content = LoginPayload()
        };

        if (forwardedFor is not null)
            request.Headers.Add("X-Forwarded-For", forwardedFor);

        return await client.SendAsync(request);
    }

    [Fact(DisplayName = "X-Forwarded-For de origem nao confiavel nao escapa do rate limit")]
    public async Task ForwardedFor_FromUntrustedOrigin_ShouldNotBypassRateLimit()
    {
        // Nenhum proxy declarado: o padrao do ASP.NET Core confia apenas em loopback,
        // e este cliente nao e loopback.
        var client = CreateClient(clientIp: "203.0.113.60");

        HttpResponseMessage? lastResponse = null;

        // Um IP forjado diferente a cada tentativa. Se o cabecalho fosse aceito, cada
        // chamada teria a sua propria particao e o limite nunca seria atingido.
        for (var attempt = 0; attempt <= AuthPermitLimit; attempt++)
            lastResponse = await PostLoginAsync(client, $"198.51.100.{attempt}");

        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse!.StatusCode);
    }

    [Fact(DisplayName = "X-Forwarded-For vindo de proxy declarado define a particao")]
    public async Task ForwardedFor_FromTrustedProxy_ShouldPartitionByRealClient()
    {
        const string proxyIp = "203.0.113.70";
        var client = CreateClient(clientIp: proxyIp, trustedProxy: proxyIp);

        // Esgota a cota do cliente real por tras do proxy.
        HttpResponseMessage? lastResponse = null;
        for (var attempt = 0; attempt <= AuthPermitLimit; attempt++)
            lastResponse = await PostLoginAsync(client, "198.51.100.200");

        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse!.StatusCode);

        // Outro cliente atras do mesmo proxy nao deve herdar o bloqueio.
        var otherClient = await PostLoginAsync(client, "198.51.100.201");
        Assert.NotEqual(HttpStatusCode.TooManyRequests, otherClient.StatusCode);
    }
}
