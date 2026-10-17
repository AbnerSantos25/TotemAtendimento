using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Totem.IntegrationTests.Api;

/// <summary>
/// A API ja teve um JsonConverter&lt;string&gt; global que removia "&lt;...&gt;" de toda
/// string desserializada. Sanitizar na entrada age na camada errada: destroi dado
/// em campos que nao sao HTML -- senhas inclusive, que passavam a ser gravadas
/// mutiladas -- e a regex era contornavel, entregando falsa confianca. A defesa
/// correta e codificar na saida, o que React e React Native ja fazem por padrao.
///
/// Este teste impede que um mutador global volte sem que a decisao seja revista.
/// </summary>
public class JsonInputIntegrityTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public JsonInputIntegrityTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact(DisplayName = "Nenhum conversor global altera strings recebidas")]
    public void JsonOptions_ShouldNotRegisterAnyStringConverter()
    {
        var jsonOptions = _factory.Services.GetRequiredService<IOptions<JsonOptions>>();

        var stringConverters = jsonOptions.Value.JsonSerializerOptions.Converters
            .Where(converter => converter.CanConvert(typeof(string)))
            .Select(converter => converter.GetType().Name)
            .ToList();

        Assert.True(
            stringConverters.Count == 0,
            "Conversor global de string registrado: " + string.Join(", ", stringConverters) +
            ". Sanitizar na entrada corrompe senhas e demais campos que nao sao HTML; " +
            "prefira codificar na saida.");
    }
}
