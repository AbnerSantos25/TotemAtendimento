using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Totem.IntegrationTests.Infrastructure;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// Testes de integração para Rate Limiting.
/// Verifica que a política Auth retorna 429 ao exceder o limite de 5 requisições
/// por minuto, e que a resposta traz a mensagem amigável em português.
/// </summary>
public class RateLimitingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const int AuthPermitLimit = 5;

    private readonly WebApplicationFactory<Program> _factory;

    public RateLimitingTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
            builder.ConfigureServices(services =>
                services.AddSingleton<IStartupFilter, TestClientIpStartupFilter>());
        });
    }

    // Cada teste recebe o seu proprio IP -- e portanto a sua propria particao no
    // rate limiter -- para que um nao consuma a cota do outro.
    private HttpClient CreateClientForIp(string ip)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.HeaderName, ip);

        // O filtro Anti-CSRF libera clientes nativos, que nao dependem de cookie
        // automatico. Sem isto as chamadas parariam em 400 antes de exercitar o
        // caminho real do login.
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");

        return client;
    }

    private static StringContent LoginPayload() => new(
        JsonSerializer.Serialize(new { email = "fake@test.com", password = "WrongPass@1" }),
        Encoding.UTF8,
        "application/json");

    private static async Task<HttpResponseMessage> ExhaustAuthLimitAsync(HttpClient client)
    {
        HttpResponseMessage? lastResponse = null;

        for (var attempt = 0; attempt <= AuthPermitLimit; attempt++)
            lastResponse = await client.PostAsync("/api/totem/identity/login", LoginPayload());

        return lastResponse!;
    }

    [Fact(DisplayName = "Rate Limiting (Auth): deve retornar 429 após 5 tentativas de login")]
    public async Task Login_AfterExceedingAuthLimit_ShouldReturn429()
    {
        var client = CreateClientForIp("203.0.113.10");

        var lastResponse = await ExhaustAuthLimitAsync(client);

        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse.StatusCode);
    }

    [Fact(DisplayName = "Rate Limiting: resposta 429 deve conter mensagem amigável em português")]
    public async Task OnRateLimitExceeded_ResponseShouldContainFriendlyMessage()
    {
        var client = CreateClientForIp("203.0.113.20");

        var lastResponse = await ExhaustAuthLimitAsync(client);
        var body = await lastResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse.StatusCode);
        Assert.Contains("Muitas requisi", body); // "Muitas requisições..."
        Assert.Contains("success", body);
        Assert.DoesNotContain("StackTrace", body);
    }

    [Fact(DisplayName = "Rate Limiting: requisições abaixo do limite não são bloqueadas")]
    public async Task Login_WithinAuthLimit_ShouldNotBeRateLimited()
    {
        var client = CreateClientForIp("203.0.113.30");

        for (var attempt = 0; attempt < AuthPermitLimit; attempt++)
        {
            var response = await client.PostAsync("/api/totem/identity/login", LoginPayload());
            Assert.NotEqual(HttpStatusCode.TooManyRequests, response.StatusCode);
        }
    }

    [Fact(DisplayName = "Rate Limiting: a cota é contada por IP de origem")]
    public async Task RateLimit_ShouldBePartitionedByClientIp()
    {
        var exhausted = CreateClientForIp("203.0.113.40");
        var untouched = CreateClientForIp("203.0.113.41");

        var blocked = await ExhaustAuthLimitAsync(exhausted);
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);

        // Outro IP nao deve herdar o bloqueio.
        var response = await untouched.PostAsync("/api/totem/identity/login", LoginPayload());
        Assert.NotEqual(HttpStatusCode.TooManyRequests, response.StatusCode);
    }
}
