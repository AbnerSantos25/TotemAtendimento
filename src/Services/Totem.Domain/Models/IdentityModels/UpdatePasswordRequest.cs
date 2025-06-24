using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.IdentityModels
{
	public class UpdatePasswordRequest
	{
		[RequiredValidation]
		public string CurrentPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		public string NewPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		[Compare("NewPassword", ErrorMessage = "A nova senha e a confirmação não conferem.")]
		public string ConfirmNewPassword { get; set; }
	}
}
