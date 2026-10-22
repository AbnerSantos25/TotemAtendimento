using System.Security.Claims;

namespace Totem.Common.Extension
{
    public static class ClaimsPrincipalExtensions
    {
        // O JwtBearer mapeia "sub" para NameIdentifier; o "sub" cobre token lido sem esse mapeamento.
        /// <summary>Id do usuário logado, ou null quando o token não traz um Guid válido.</summary>
        public static Guid? GetUserId(this ClaimsPrincipal user) =>
            Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub"), out var id) ? id : null;
    }
}
