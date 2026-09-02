using Microsoft.Extensions.Configuration;
using Totem.Common.Extension;

namespace Totem.UnitTests.Configuration;

// A duracao da sessao passou a vir de JwtSettings.RefreshTokenExpirationHours.
// Se o binder zerasse a propriedade quando a chave nao existe, todo refresh token
// nasceria expirado -- estes testes travam o default e a precedencia da config.
public class JwtSettingsTests
{
    private static IConfiguration BuildConfig(params (string Key, string Value)[] entries)
    {
        var values = new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = "chave-de-teste-com-mais-de-32-caracteres",
            ["Jwt:Issuer"] = "TotemAtendimento",
            ["Jwt:ValidAt"] = "https://localhost",
            ["Jwt:ExpirationTime"] = "1",
        };

        foreach (var (key, value) in entries)
            values[key] = value;

        return new ConfigurationBuilder().AddInMemoryCollection(values).Build();
    }

    [Fact(DisplayName = "Sem a chave configurada, a sessao cai no default de 8 horas")]
    public void RefreshTokenExpirationHours_WhenKeyIsMissing_ShouldFallBackToShiftDefault()
    {
        var settings = BuildConfig().GetSection("Jwt").Get<JwtSettings>();

        Assert.NotNull(settings);
        Assert.Equal(8, settings!.RefreshTokenExpirationHours);
    }

    [Fact(DisplayName = "Valor configurado prevalece sobre o default")]
    public void RefreshTokenExpirationHours_WhenConfigured_ShouldOverrideDefault()
    {
        var settings = BuildConfig(("Jwt:RefreshTokenExpirationHours", "12"))
            .GetSection("Jwt")
            .Get<JwtSettings>();

        Assert.NotNull(settings);
        Assert.Equal(12, settings!.RefreshTokenExpirationHours);
    }

    [Fact(DisplayName = "As demais chaves de Jwt continuam sendo lidas")]
    public void JwtSettings_ShouldBindRemainingKeys()
    {
        var settings = BuildConfig().GetSection("Jwt").Get<JwtSettings>();

        Assert.NotNull(settings);
        Assert.Equal("TotemAtendimento", settings!.Issuer);
        Assert.Equal("https://localhost", settings.ValidAt);
        Assert.Equal(1, settings.ExpirationTime);
    }
}
