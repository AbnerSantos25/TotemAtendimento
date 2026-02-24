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
