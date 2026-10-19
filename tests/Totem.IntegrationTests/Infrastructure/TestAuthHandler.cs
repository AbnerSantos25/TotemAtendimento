using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace Totem.IntegrationTests.Infrastructure;

/// <summary>
/// Autentica toda requisicao como o usuario de teste, com a role informada no cabecalho
/// <c>X-Test-Role</c>. Sem o cabecalho, a requisicao segue anonima (401 nas rotas protegidas).
/// Permite exercitar endpoints [Authorize] sem banco nem JWT real.
/// </summary>
internal sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    internal const string SchemeName = "Test";
    internal const string RoleHeader = "X-Test-Role";

    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(RoleHeader, out var role))
            return Task.FromResult(AuthenticateResult.NoResult());

        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, role.ToString()) },
            SchemeName);

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }

    /// <summary>Troca o esquema JWT da API pelo de teste.</summary>
    internal static void Register(IServiceCollection services)
    {
        services.AddAuthentication().AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(SchemeName, _ => { });
        services.PostConfigure<AuthenticationOptions>(options =>
        {
            options.DefaultAuthenticateScheme = SchemeName;
            options.DefaultChallengeScheme = SchemeName;
        });
    }
}
