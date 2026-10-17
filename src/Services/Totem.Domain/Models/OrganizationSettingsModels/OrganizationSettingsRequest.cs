using Totem.Common.Validation;

namespace Totem.Domain.Models.OrganizationSettingsModels
{
	/// <summary>Campos do multipart do PUT. O arquivo da logo chega a parte, pelo controller.</summary>
	public class OrganizationSettingsRequest
	{
		[RequiredValidation]
		[StringLengthValidation(3, 100)]
		public string Name { get; set; }

		[RequiredValidation]
		[StringLengthValidation(14, 18)]
		public string Cnpj { get; set; }

		[RequiredValidation]
		[StringLengthValidation(4, 263)]
		public string WebsiteUrl { get; set; }

		/// <summary>Remove a logo atual. Ignorado quando um arquivo novo e enviado.</summary>
		public bool RemoveLogo { get; set; }
	}
}
