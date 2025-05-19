using System.ComponentModel.DataAnnotations;
using System;

namespace Totem.Common.Validation
{
	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class RequiredValidationAttribute : ValidationAttribute
	{
		public RequiredValidationAttribute()
		{
			// Mensagem padrão; será sobrescrita se você passar ErrorMessage
			ErrorMessage = "O campo {0} é obrigatório.";
		}

		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			// Se for nulo ou string vazia/whitespace, falha
			if (value == null || (value is string s && string.IsNullOrWhiteSpace(s)))
			{
				// validationContext.DisplayName = “NomeDaPropriedade” ou valor de [Display(Name="…")]
				var errorMessage = FormatErrorMessage(validationContext.DisplayName);
				return new ValidationResult(errorMessage);
			}

			return ValidationResult.Success;
		}
	}
}