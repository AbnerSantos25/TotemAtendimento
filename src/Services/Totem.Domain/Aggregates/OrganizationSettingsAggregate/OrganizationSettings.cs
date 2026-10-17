using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.ValueObject;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	/// <summary>Dados da organizacao exibidos no painel de senhas. Existe um unico registro.</summary>
	public class OrganizationSettings : Entity, IAggregateRoot
	{
		public string Name { get; private set; }
		public Cnpj Cnpj { get; private set; }
		public string WebsiteUrl { get; private set; }
		public byte[]? Logo { get; private set; }
		public string? LogoContentType { get; private set; }
		public DateTime UpdatedAt { get; private set; }

		protected OrganizationSettings() { }

		public OrganizationSettings(string name, Cnpj cnpj, string websiteUrl)
		{
			Update(name, cnpj, websiteUrl);
		}

		public void Update(string name, Cnpj cnpj, string websiteUrl)
		{
			Name = name;
			Cnpj = cnpj;
			WebsiteUrl = websiteUrl;
			UpdatedAt = DateTime.UtcNow;
		}

		public void SetLogo(byte[] logo, string contentType)
		{
			Logo = logo;
			LogoContentType = contentType;
			UpdatedAt = DateTime.UtcNow;
		}

		public void RemoveLogo()
		{
			Logo = null;
			LogoContentType = null;
			UpdatedAt = DateTime.UtcNow;
		}
	}
}
