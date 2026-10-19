namespace Totem.Common.ValueObject
{
	public record HexColor
	{
		public string? Value { get; }

		public HexColor(string value)
		{
			if (string.IsNullOrWhiteSpace(value) || !value.StartsWith("#") || value.Length > 7)
				throw new ArgumentException("Cor inválida.");

			Value = value;
		}

		/// <summary>
		/// Regra para entrada nova (#RGB ou #RRGGBB). O construtor e mais tolerante de proposito:
		/// o EF o usa ao ler o banco, e endurece-lo quebraria a leitura de cores ja gravadas.
		/// </summary>
		public static bool IsValid(string? value) =>
			value is not null && System.Text.RegularExpressions.Regex.IsMatch(value, "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$");

		public override string ToString()
		{
			return Value;
		}

		public HexColor? CreateColor(string? color)
		{
			if (color is null) return null;
			return new HexColor(color);
		}
	}
}
