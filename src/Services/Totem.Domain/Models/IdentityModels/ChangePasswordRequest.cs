using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.IdentityModels
{
	public class ChangePasswordRequest
	{
		[RequiredValidation]
		public string OldPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		[CannotEqual("OldPassword", ErrorMessage = "A nova senha não pode ser igual à senha anterior.")]
		public string NewPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		[Compare("NewPassword", ErrorMessage = "A nova senha e a confirmação não conferem.")]
		public string ConfirmNewPassword { get; set; }
	}
}
