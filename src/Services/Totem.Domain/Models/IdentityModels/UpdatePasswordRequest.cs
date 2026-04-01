using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;
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
		[Compare("NewPassword", ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordConfirmationMismatch))]
		public string ConfirmNewPassword { get; set; }
	}
}
