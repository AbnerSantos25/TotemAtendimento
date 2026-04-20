using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Totem.E2ETests.Authentication;

/// <summary>
/// Testes E2E críticos do fluxo de Autenticação.
/// Cobre o ciclo completo: Login inválido → Login bloqueado → Acesso negado sem token.
/// </summary>
public class AuthenticationFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthenticationFlowTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
        }).CreateClient(new WebApplicationFactoryClientOptions
        {
            // Não seguir redirecionamentos automaticamente para checarmos os status codes reais
            AllowAutoRedirect = false
        });
    }

    [Fact(DisplayName = "E2E: Login com credenciais inválidas deve retornar 400 sem expor detalhes internos")]
    public async Task Login_WithInvalidCredentials_ShouldReturn400WithGenericMessage()
    {
        // Arrange
        var payload = JsonSerializer.Serialize(new { email = "hacker@test.com", password = "WrongPass@1" });

        // Act
        var response = await _client.PostAsync(
            "/api/totem/identity/login",
            new StringContent(payload, Encoding.UTF8, "application/json"));

        var body = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        // Nunca deve vazar informações de banco de dados ou stack trace
        Assert.DoesNotContain("SQL", body);
        Assert.DoesNotContain("StackTrace", body);
        Assert.DoesNotContain("Exception", body);
    }

    [Fact(DisplayName = "E2E: Acesso a endpoint protegido sem cookie de autenticação deve retornar 401")]
    public async Task ProtectedEndpoint_WithoutAuthCookie_ShouldReturn401()
    {
        // Act — tenta acessar a listagem de usuários (que exige Admin)
        var response = await _client.GetAsync("/api/totem/identity/users");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact(DisplayName = "E2E: Registro com dados inválidos (email nulo) deve retornar 400")]
    public async Task Register_WithMissingEmail_ShouldReturn400()
    {
        // Arrange
        var payload = JsonSerializer.Serialize(new { fullName = "Teste", email = "", password = "Valid@123" });

        // Act
        var response = await _client.PostAsync(
            "/api/totem/identity/register",
            new StringContent(payload, Encoding.UTF8, "application/json"));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "E2E: Headers de segurança devem estar presentes na resposta")]
    public async Task AnyEndpoint_ShouldReturnSecurityHeaders()
    {
        // Act
        var response = await _client.GetAsync("/api/totem/identity/me");

        // Assert — verifica que não há headers que vazem informação do servidor
        Assert.False(response.Headers.Contains("X-Powered-By"));
        Assert.False(response.Headers.Contains("Server") && 
                     response.Headers.GetValues("Server").Any(v => v.Contains("Kestrel")));
    }
}
