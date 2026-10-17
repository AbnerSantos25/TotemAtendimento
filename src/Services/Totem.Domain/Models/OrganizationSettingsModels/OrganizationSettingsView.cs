using Totem.Domain.Aggregates.OrganizationSettingsAggregate;

namespace Totem.Domain.Models.OrganizationSettingsModels
{
	public class OrganizationSettingsView
	{
		/// <summary>Rota da logo relativa a base da API, no mesmo formato dos endpoints usados pelo front.</summary>
		public const string LogoPath = "/totem/OrganizationSettings/logo";

		public string Name { get; set; }
		public string Cnpj { get; set; }
		public string WebsiteUrl { get; set; }

		/// <summary>Null quando nao ha logo. O "?v=" muda a cada alteracao, entao a imagem pode ficar em cache.</summary>
		public string? LogoUrl { get; set; }

		public static string BuildLogoUrl(DateTime updatedAt) => $"{LogoPath}?v={updatedAt.Ticks}";

		public static implicit operator OrganizationSettingsView(OrganizationSettings organizationSettings)
		{
			if (organizationSettings is null) return null;

			return new OrganizationSettingsView
			{
				Name = organizationSettings.Name,
				Cnpj = organizationSettings.Cnpj.Value,
				WebsiteUrl = organizationSettings.WebsiteUrl,
				LogoUrl = organizationSettings.Logo is null ? null : BuildLogoUrl(organizationSettings.UpdatedAt)
			};
		}
	}
}
