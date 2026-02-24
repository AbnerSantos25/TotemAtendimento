namespace Totem.Domain.Aggregates.ServiceTypeAggregate
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
	}
}
