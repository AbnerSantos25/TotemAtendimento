using System.Text.RegularExpressions;

namespace Totem.Common.ValueObject
{
	/// <summary>
	/// CNPJ numerico ou alfanumerico (IN RFB 2.229/2024, vigente desde jul/2026).
	/// Guardado sem mascara e em maiusculo: 12 caracteres [A-Z0-9] + 2 digitos verificadores.
	/// </summary>
	public record Cnpj
	{
		private static readonly Regex Format = new("^[A-Z0-9]{12}[0-9]{2}$", RegexOptions.Compiled);
		private static readonly int[] FirstDigitWeights = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
		private static readonly int[] SecondDigitWeights = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

		public string Value { get; }

		public Cnpj(string value)
		{
			if (!IsValid(value))
				throw new ArgumentException("CNPJ inválido.", nameof(value));

			Value = Normalize(value);
		}

		public static bool IsValid(string? value)
		{
			if (string.IsNullOrWhiteSpace(value)) return false;

			var cnpj = Normalize(value);
			if (!Format.IsMatch(cnpj) || cnpj.Distinct().Count() == 1) return false;

			var firstDigit = CalculateDigit(cnpj[..12], FirstDigitWeights);
			var secondDigit = CalculateDigit(cnpj[..12] + firstDigit, SecondDigitWeights);

			return cnpj[12] - '0' == firstDigit && cnpj[13] - '0' == secondDigit;
		}

		private static string Normalize(string value) =>
			new string(value.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();

		private static int CalculateDigit(string baseValue, int[] weights)
		{
			var sum = baseValue.Select((c, i) => (c - '0') * weights[i]).Sum();
			var rest = sum % 11;
			return rest < 2 ? 0 : 11 - rest;
		}

		public override string ToString()
		{
			return Value;
		}
	}
}
