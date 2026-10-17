using Totem.Common.ValueObject;

namespace Totem.UnitTests.ValueObject
{
	public class CnpjTests
	{
		[Theory(DisplayName = "CNPJ válido, numérico ou alfanumérico, com ou sem máscara")]
		[InlineData("11222333000181")]
		[InlineData("11.222.333/0001-81")]
		[InlineData("12ABC34501DE35")]
		[InlineData("12.ABC.345/01DE-35")]
		[InlineData("12.abc.345/01de-35")]
		public void IsValid_WhenCheckDigitsMatch_ShouldReturnTrue(string value)
		{
			Assert.True(Cnpj.IsValid(value));
		}

		[Theory(DisplayName = "CNPJ inválido é recusado e não pode ser construído")]
		[InlineData("11222333000182")] // DV errado
		[InlineData("12ABC34501DE36")] // DV errado (alfanumérico)
		[InlineData("00000000000000")] // todos iguais
		[InlineData("1122233300018")]  // 13 caracteres
		[InlineData("12ABC34501DEA5")] // letra na posição do DV
		[InlineData("")]
		[InlineData(null)]
		public void IsValid_WhenInvalid_ShouldReturnFalseAndConstructorShouldThrow(string? value)
		{
			Assert.False(Cnpj.IsValid(value));
			Assert.Throws<ArgumentException>(() => new Cnpj(value!));
		}

		[Fact(DisplayName = "CNPJ é guardado sem máscara e em maiúsculo")]
		public void Constructor_ShouldNormalizeValue()
		{
			Assert.Equal("12ABC34501DE35", new Cnpj("12.abc.345/01de-35").Value);
		}
	}
}
