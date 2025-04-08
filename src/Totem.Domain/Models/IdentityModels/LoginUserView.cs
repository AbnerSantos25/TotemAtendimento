using System.ComponentModel.DataAnnotations;

namespace Totem.Domain.Models.IdentityModels
{
    public class LoginUserView
    {
        public string Name { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "O {0} está em um formato inválido.")]
        public string Email { get; set; }
        [Required]
        [StringLength(100, ErrorMessage = "A senha deve ter entre {2} e {1} caracteres.", MinimumLength = 6)]
        public string Password { get; set; }
    }
}
