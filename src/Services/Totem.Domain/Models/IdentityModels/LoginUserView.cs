using System.ComponentModel.DataAnnotations;

namespace Totem.Domain.Models.IdentityModels
{
    public class LoginUserView
    {
		[Required]
		[StringLength(100, ErrorMessage = "O Campo Nome deve ter entre {2} e {1} caracteres.", MinimumLength = 3)]
        public string Email { get; set; }

		[Required]
        [StringLength(100, ErrorMessage = "A senha deve ter entre {2} e {1} caracteres.", MinimumLength = 6)]
        public string Password { get; set; }
	}
}
