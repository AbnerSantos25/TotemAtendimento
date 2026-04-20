using Totem.Common.Security;
using System.Text.Json;

namespace Totem.UnitTests.Security;

// Testa o conversor que impede payloads XSS de chegarem no backend.
public class HtmlSanitizerStringConverterTests
{
    private readonly JsonSerializerOptions _options;

    public HtmlSanitizerStringConverterTests()
    {
        _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        _options.Converters.Add(new HtmlSanitizerStringConverter());
    }

    [Fact(DisplayName = "Deve remover tags <script> de strings JSON")]
    public void Read_WithScriptTag_ShouldStripTag()
    {
        // Arrange
        var json = """{"value":"<script>alert('xss')</script>"}""";

        // Act
        var result = JsonSerializer.Deserialize<TestPayload>(json, _options);

        // Assert
        Assert.NotNull(result);
        Assert.DoesNotContain("<script>", result!.Value ?? "");
        Assert.DoesNotContain("</script>", result.Value ?? "");
    }

    [Fact(DisplayName = "Deve remover tags HTML arbitrárias e manter o texto limpo")]
    public void Read_WithArbitraryHtmlTag_ShouldStripTagAndKeepText()
    {
        var json = """{"value":"<img src=x onerror=alert(1)>texto limpo"}""";
        var result = JsonSerializer.Deserialize<TestPayload>(json, _options);
        Assert.Equal("texto limpo", result!.Value);
    }

    [Fact(DisplayName = "Não deve alterar string sem HTML")]
    public void Read_WithPlainString_ShouldReturnUnchanged()
    {
        var json = """{"value":"Atendimento Preferencial"}""";
        var result = JsonSerializer.Deserialize<TestPayload>(json, _options);
        Assert.Equal("Atendimento Preferencial", result!.Value);
    }

    [Fact(DisplayName = "Deve tratar string nula sem lançar exceção")]
    public void Read_WithNullString_ShouldReturnNull()
    {
        var json = """{"value":null}""";
        var result = JsonSerializer.Deserialize<TestPayload>(json, _options);
        Assert.Null(result!.Value);
    }
}

public record TestPayload(string? Value);
