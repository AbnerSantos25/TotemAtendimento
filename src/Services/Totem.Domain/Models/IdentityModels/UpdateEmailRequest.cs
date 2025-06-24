using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.IdentityModels
{
	public class UpdateEmailRequest
	{
		[RequiredValidation]
		[StringLength(100, ErrorMessage = "O {0} deve ter entre {2} e {1} caracteres.", MinimumLength = 2)]
		[EmailAddress(ErrorMessage = "O {0} está em um formato inválido.")]
		public string NewEmail { get; set; }

		[RequiredValidation]
		[Compare("NewEmail", ErrorMessage = "O e-mail de confirmação não confere com o novo e-mail.")]
		public string ConfirmEmail { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		public string Password { get; set; }
	}
}
