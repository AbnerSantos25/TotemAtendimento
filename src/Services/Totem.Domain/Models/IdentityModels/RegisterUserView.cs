using System.ComponentModel.DataAnnotations;

namespace Totem.Domain.Models.IdentityModels
{
    public class RegisterUserView
    {
        [Required]
        [StringLength(100, ErrorMessage = "O {0} deve ter entre {2} e {1} caracteres.", MinimumLength = 2)]
        [EmailAddress(ErrorMessage = "O {0} está em um formato inválido.")]
        public string Email { get; set; }
        [Required]
        [StringLength(100, ErrorMessage = "A senha deve ter entre {2} e {1} caracteres.", MinimumLength = 6)]
        public string Password { get; set; }

        [Compare("Password", ErrorMessage = "As senhas não conferem.")]
        public string ConfirmPassword { get; set; }
        [Required]
        [StringLength(200, ErrorMessage = "O Nome deve ter entre {2} e {1} caracteres.", MinimumLength = 3)]
		public string FullName { get; set; }
	}
}
