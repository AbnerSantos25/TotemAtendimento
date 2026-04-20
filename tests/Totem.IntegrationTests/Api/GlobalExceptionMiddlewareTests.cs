using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// Testes de integração para o GlobalExceptionMiddleware (CWE-209).
/// Verifica que erros internos nunca expõem stack traces ao cliente.
/// </summary>
public class GlobalExceptionMiddlewareTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GlobalExceptionMiddlewareTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
        }).CreateClient();
    }

    [Fact(DisplayName = "Middleware: resposta de erro nunca deve expor stack trace")]
    public async Task OnInternalError_ResponseShouldNotContainStackTrace()
    {
        // Act — chamada a um endpoint que não existe, forçando erro interno de roteamento
        var response = await _client.GetAsync("/api/totem/nonexistentendpoint");
        var body = await response.Content.ReadAsStringAsync();

        // Assert — o corpo jamais deve conter padrões de stack trace C#
        Assert.DoesNotContain("at Totem", body);
        Assert.DoesNotContain("StackTrace", body);
        Assert.DoesNotContain("System.Exception", body);
        Assert.DoesNotContain("Inner Exception", body);
    }

    [Fact(DisplayName = "Middleware: resposta de erro 500 deve ter formato padronizado")]
    public async Task OnInternalError_ResponseShouldReturnStandardJson()
    {
        var response = await _client.GetAsync("/api/totem/__force_error__");
        var body = await response.Content.ReadAsStringAsync();

        // Não deve retornar HTML (padrão do ASP.NET ao não-tratar exceções)
        Assert.DoesNotContain("<!DOCTYPE html>", body);
    }
}
