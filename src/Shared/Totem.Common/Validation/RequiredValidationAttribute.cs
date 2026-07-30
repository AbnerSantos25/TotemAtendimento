using System.ComponentModel.DataAnnotations;
using System;

namespace Totem.Common.Validation
{
	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class RequiredValidationAttribute : ValidationAttribute
	{
		public RequiredValidationAttribute()
		{
			ErrorMessage = "O campo {0} é obrigatório.";
		}

		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			if (value == null || (value is string s && string.IsNullOrWhiteSpace(s)))
			{
				var errorMessage = FormatErrorMessage(validationContext.DisplayName);
				return new ValidationResult(errorMessage);
			}

			return ValidationResult.Success;
		}
	}
}