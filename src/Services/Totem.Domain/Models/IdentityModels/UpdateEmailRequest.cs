using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Models.IdentityModels
{
	public class UpdateEmailRequest
	{
		[RequiredValidation]
		[StringLength(100, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.GenericFieldMustBeRange), MinimumLength = 2)]
		[EmailAddress(ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.InvalidFormat))]
		public string NewEmail { get; set; }

		[RequiredValidation]
		[Compare("NewEmail", ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.EmailConfirmationMismatch))]
		public string ConfirmEmail { get; set; }

		[RequiredValidation]
		[DataType(DataType.Password)]
		public string Password { get; set; }
	}
}
