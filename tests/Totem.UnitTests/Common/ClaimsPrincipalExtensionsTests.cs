using System.Security.Claims;
using Totem.Common.Extension;

namespace Totem.UnitTests.Common;

public class ClaimsPrincipalExtensionsTests
{
    private static ClaimsPrincipal With(params Claim[] claims) => new(new ClaimsIdentity(claims, "test"));

    [Fact(DisplayName = "Lê o id do NameIdentifier ou, na falta dele, do sub")]
    public void GetUserId_ReadsNameIdentifierOrSub()
    {
        var id = Guid.NewGuid();

        Assert.Equal(id, With(new Claim(ClaimTypes.NameIdentifier, id.ToString())).GetUserId());
        Assert.Equal(id, With(new Claim("sub", id.ToString())).GetUserId());
    }

    [Fact(DisplayName = "Sem claim de id ou com valor que não é Guid, devolve null")]
    public void GetUserId_WhenMissingOrInvalid_ReturnsNull()
    {
        Assert.Null(With().GetUserId());
        Assert.Null(With(new Claim(ClaimTypes.NameIdentifier, "abc")).GetUserId());
    }
}
