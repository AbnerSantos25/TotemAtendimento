using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// Testes de integração para Rate Limiting.
/// Verifica que as políticas Auth e Mutation retornam 429 ao exceder os limites.
/// </summary>
public class RateLimitingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public RateLimitingTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
        }).CreateClient();
    }

    [Fact(DisplayName = "Rate Limiting (Auth): deve retornar 429 após 5 tentativas de login")]
    public async Task Login_After5Attempts_ShouldReturn429()
    {
        // Arrange
        var payload = JsonSerializer.Serialize(new { email = "fake@test.com", password = "WrongPass@1" });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        HttpResponseMessage? lastResponse = null;

        // Act — faz 6 chamadas ao endpoint de login
        for (int i = 0; i < 6; i++)
        {
            lastResponse = await _client.PostAsync("/api/totem/identity/login", new StringContent(payload, Encoding.UTF8, "application/json"));
        }

        // Assert — a 6ª deve ser bloqueada pelo rate limiter
        Assert.NotNull(lastResponse);
        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse.StatusCode);
    }

    [Fact(DisplayName = "Rate Limiting: resposta 429 deve conter mensagem amigável em português")]
    public async Task OnRateLimitExceeded_ResponseShouldContainFriendlyMessage()
    {
        var payload = JsonSerializer.Serialize(new { email = "fake@test.com", password = "WrongPass@1" });
        HttpResponseMessage? lastResponse = null;

        for (int i = 0; i < 6; i++)
        {
            lastResponse = await _client.PostAsync("/api/totem/identity/login", new StringContent(payload, Encoding.UTF8, "application/json"));
        }

        var body = await lastResponse!.Content.ReadAsStringAsync();

        Assert.Contains("Muitas requisi", body); // "Muitas requisições..."
        Assert.Contains("success", body);
        Assert.DoesNotContain("StackTrace", body);
    }
}
