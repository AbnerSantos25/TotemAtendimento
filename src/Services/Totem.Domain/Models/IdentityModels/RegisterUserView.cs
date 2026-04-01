using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Models.IdentityModels
{
    public class RegisterUserView
    {
        [Required]
        [StringLength(100, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.GenericFieldMustBeRange), MinimumLength = 2)]
        [EmailAddress(ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.InvalidFormat))]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordLengthRange), MinimumLength = 6)]
        public string Password { get; set; }

        [Compare("Password", ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordsMismatch))]
        public string ConfirmPassword { get; set; }

        [Required]
        [StringLength(200, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.NameLengthRange), MinimumLength = 3)]
		public string FullName { get; set; }
	}
}
