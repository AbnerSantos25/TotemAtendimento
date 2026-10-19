using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Common.ValueObject;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	/// <summary>Dados da organizacao exibidos no painel de senhas. Existe um unico registro.</summary>
	public class OrganizationSettings : Entity, IAggregateRoot
	{
		public const int NameMinLength = 3;
		public const int NameMaxLength = 100;
		public const int WebsiteMaxLength = 255;
		public const int LogoMaxBytes = 1024 * 1024;
		public static readonly IReadOnlyList<string> AllowedLogoContentTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

		public string Name { get; private set; }
		public Cnpj Cnpj { get; private set; }
		public string WebsiteUrl { get; private set; }
		public byte[]? Logo { get; private set; }
		public string? LogoContentType { get; private set; }
		public DateTime UpdatedAt { get; private set; }

		private OrganizationSettingsValidation? _validations;
		[NotMapped, JsonIgnore]
		public OrganizationSettingsValidation Validations => _validations ??= new(this);

		protected OrganizationSettings() { }

		public OrganizationSettings(string name, Cnpj cnpj, string websiteUrl)
		{
			Update(name, cnpj, websiteUrl);
		}

		public void Update(string name, Cnpj cnpj, string websiteUrl)
		{
			if (!IsValid || !Validations.AllowedSave(name, cnpj, websiteUrl))
				throw new DomainException(Errors.FailedToSaveOrganizationSettings);

			Name = name;
			Cnpj = cnpj;
			WebsiteUrl = websiteUrl;
			UpdatedAt = DateTime.UtcNow;
		}

		public void SetLogo(byte[] logo, string contentType)
		{
			if (!IsValid || !Validations.AllowedSetLogo(logo, contentType))
				throw new DomainException(Errors.FailedToSaveOrganizationSettings);

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
