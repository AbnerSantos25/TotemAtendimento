using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Models.IdentityModels
{
    public class LoginUserView
    {
		[Required]
		[StringLength(100, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.NameFieldLengthRange), MinimumLength = 3)]
        public string Email { get; set; }

		[Required]
        [StringLength(100, ErrorMessageResourceType = typeof(Errors), ErrorMessageResourceName = nameof(Errors.PasswordLengthRange), MinimumLength = 6)]
        public string Password { get; set; }
	}
}
