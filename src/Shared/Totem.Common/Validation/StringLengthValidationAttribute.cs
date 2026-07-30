using System.ComponentModel.DataAnnotations;

namespace Totem.Common.Validation
{
	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class StringLengthValidationAttribute : ValidationAttribute
	{
		private readonly int _minLength;
		private readonly int _maxLength;
		private readonly bool _allowNull;

		/// <summary>
		/// Valida o comprimento de uma string.
		/// </summary>
		/// <param name="minLength">Comprimento mínimo da string</param>
		/// <param name="maxLength">Comprimento máximo da string. Se igual a minLength, o comprimento deve ser exato.</param>
		/// <param name="allowNull">Se verdadeiro, o campo pode ser nulo. Se falso, um campo nulo será considerado inválido.</param>
		public StringLengthValidationAttribute(int minLength, int maxLength, bool allowNull = true)
		{
			if (minLength < 0)
				throw new ArgumentException("Comprimento mínimo não pode ser negativo.", nameof(minLength));

			if (maxLength < 0)
				throw new ArgumentException("Comprimento máximo não pode ser negativo.", nameof(maxLength));

			if (minLength > maxLength)
				throw new ArgumentException("Comprimento mínimo não pode ser maior que o comprimento máximo.", nameof(minLength));

			_minLength = minLength;
			_maxLength = maxLength;
			_allowNull = allowNull;

			SetErrorMessage();
		}

		private void SetErrorMessage()
		{
			if (_minLength == _maxLength)
			{
				ErrorMessage = $"O campo {{0}} deve ter exatamente {_minLength} caracteres.";
			}
			else
			{
				ErrorMessage = $"O campo {{0}} deve ter entre {_minLength} e {_maxLength} caracteres.";
			}
		}

		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			if (value == null || (value is string s && string.IsNullOrEmpty(s)))
			{
				if (!_allowNull)
				{
					return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
				}

				return ValidationResult.Success;
			}

			var stringValue = value as string;
			if (stringValue == null)
			{
				return new ValidationResult($"O campo {validationContext.DisplayName} deve ser uma string.");
			}

			int length = stringValue.Length;

			if (length < _minLength || length > _maxLength)
			{
				return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
			}

			return ValidationResult.Success;
		}
	}
}
