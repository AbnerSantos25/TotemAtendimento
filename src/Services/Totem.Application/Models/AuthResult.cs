using Totem.SharedKernel.Models;

namespace Totem.Application.Models
{
    public class AuthResult
    {
        public string Jwt { get; set; } = string.Empty;
        public Guid RefreshToken { get; set; }
        public UserView UserView { get; set; } = new();
    }
}
