using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;

namespace Totem.Common.Validation
{
	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class CannotEqualAttribute : ValidationAttribute
	{
		private readonly string _otherPropertyName;

		public CannotEqualAttribute(string otherPropertyName)
		{
			_otherPropertyName = otherPropertyName;
		}

		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			if (value == null)
				return ValidationResult.Success;

			var otherProperty = validationContext.ObjectType.GetProperty(_otherPropertyName);
			if (otherProperty == null)
				return new ValidationResult(string.Format(Errors.PropertyNotFound, _otherPropertyName));

			var otherValue = otherProperty.GetValue(validationContext.ObjectInstance);

			if (value.Equals(otherValue))
			{
				var errorMessage = ErrorMessage ?? string.Format(Errors.GenericValueCannotBeEqual, validationContext.DisplayName, _otherPropertyName);
				return new ValidationResult(errorMessage);
			}

			return ValidationResult.Success;
		}
	}
}
