using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Models.IdentityModels
{
	public class ChangePasswordRequest
	{
		[RequiredValidation]
		public string OldPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		[CannotEqual("OldPassword", ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordCannotBeEqual))]
		public string NewPassword { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		[Compare("NewPassword", ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordConfirmationMismatch))]
		public string ConfirmNewPassword { get; set; }
	}
}
