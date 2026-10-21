using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Text;
using System.Text.Json;
using Totem.IntegrationTests.Infrastructure;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// Entrada invalida responde 400 no formato padrao da API ({ success, errors[] }),
/// e nao no ValidationProblemDetails automatico do [ApiController].
/// </summary>
public class ValidationResponseTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ValidationResponseTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
            builder.ConfigureServices(services =>
            {
                services.AddSingleton<IStartupFilter, TestClientIpStartupFilter>();
                TestAuthHandler.Register(services);
            });
        });
    }

    [Fact(DisplayName = "JSON malformado responde 400 com success=false e lista de erros")]
    public async Task MalformedJson_ShouldReturnStandardBadRequest()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.HeaderName, "10.0.0.201");
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");

        var response = await client.PostAsync(
            "/api/totem/identity/login",
            new StringContent("{ \"email\": ", Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.False(body.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal(JsonValueKind.Array, body.RootElement.GetProperty("errors").ValueKind);
        Assert.NotEqual(0, body.RootElement.GetProperty("errors").GetArrayLength());
    }

    private HttpClient CreateAdminClient(string ip)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.HeaderName, ip);
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, "Admin");
        return client;
    }

    private static StringContent Json(object value) =>
        new(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json");

    private static async Task<string[]> ReadErrorsAsync(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.False(body.RootElement.GetProperty("success").GetBoolean());
        return body.RootElement.GetProperty("errors").EnumerateArray().Select(e => e.GetString()!).ToArray();
    }

    [Fact(DisplayName = "Cor inválida em tipo de serviço responde 400 com mensagem (antes era 500)")]
    public async Task CreateServiceType_WithInvalidColor_ShouldReturn400()
    {
        var response = await CreateAdminClient("10.0.0.202").PostAsync("/api/totem/ServiceType",
            Json(new { title = "Exames", color = "#GGG", targetQueueId = Guid.NewGuid() }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Cor inválida. Use o formato #RGB ou #RRGGBB.", await ReadErrorsAsync(response));
    }

    [Fact(DisplayName = "Regra do Contract responde 400 com o nome do campo vindo do Labels.resx")]
    public async Task CreateServiceType_WithTitleTooLong_ShouldReturnPortugueseMessage()
    {
        var response = await CreateAdminClient("10.0.0.203").PostAsync("/api/totem/ServiceType",
            Json(new { title = new string('a', 101), targetQueueId = Guid.NewGuid() }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Título deve ter no máximo 100 caracteres.", await ReadErrorsAsync(response));
    }

    [Fact(DisplayName = "Fila de destino vazia (Guid.Empty) responde 400; o atributo não pegava esse caso")]
    public async Task CreateServiceType_WithEmptyTargetQueue_ShouldReturn400()
    {
        var response = await CreateAdminClient("10.0.0.204").PostAsync("/api/totem/ServiceType",
            Json(new { title = "Exames", targetQueueId = Guid.Empty }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("O campo Fila Destino é obrigatório.", await ReadErrorsAsync(response));
    }

    [Fact(DisplayName = "Título vazio responde 400 com a mensagem do Contract")]
    public async Task CreateServiceType_WithEmptyTitle_ShouldReturn400()
    {
        var response = await CreateAdminClient("10.0.0.205").PostAsync("/api/totem/ServiceType",
            Json(new { title = "", targetQueueId = Guid.NewGuid() }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(new[] { "O campo Título é obrigatório." }, await ReadErrorsAsync(response));
    }

    [Fact(DisplayName = "Todos os erros de entrada voltam na mesma resposta (antes a cor só aparecia no segundo envio)")]
    public async Task CreateServiceType_WithSeveralErrors_ShouldReturnAllAtOnce()
    {
        var response = await CreateAdminClient("10.0.0.206").PostAsync("/api/totem/ServiceType",
            Json(new { title = "", color = "#GGG", targetQueueId = Guid.NewGuid() }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(
            new[] { "O campo Título é obrigatório.", "Cor inválida. Use o formato #RGB ou #RRGGBB." },
            await ReadErrorsAsync(response));
    }

    [Fact(DisplayName = "Login vazio responde só em pt-BR, sem o \"field is required\" implícito do MVC")]
    public async Task Login_WithEmptyBody_ShouldReturnOnlyPortugueseMessages()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.HeaderName, "10.0.0.207");
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");

        var response = await client.PostAsync("/api/totem/identity/login", Json(new { }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(new[] { "O campo E-mail é obrigatório.", "O campo Senha é obrigatório." }, await ReadErrorsAsync(response));
    }
}
