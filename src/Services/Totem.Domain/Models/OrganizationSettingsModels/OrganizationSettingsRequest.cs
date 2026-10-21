namespace Totem.Domain.Models.OrganizationSettingsModels
{
	/// <summary>Campos do multipart do PUT. O arquivo da logo chega a parte, pelo controller.</summary>
	public class OrganizationSettingsRequest
	{
		public string Name { get; set; }
		public string Cnpj { get; set; }
		public string WebsiteUrl { get; set; }

		/// <summary>Remove a logo atual. Ignorado quando um arquivo novo e enviado.</summary>
		public bool RemoveLogo { get; set; }
	}
}
