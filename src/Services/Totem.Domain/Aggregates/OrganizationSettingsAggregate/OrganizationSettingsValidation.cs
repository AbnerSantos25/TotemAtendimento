using System.Text.RegularExpressions;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;
using Totem.Common.ValueObject;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	public class OrganizationSettingsValidation(OrganizationSettings settings)
	{
		public bool AllowedSave(string name, Cnpj cnpj, string websiteUrl)
		{
			settings.Requires()
				.IsValid(OrganizationSettingsConstructorValidation.AllowedSave(name, cnpj?.Value, websiteUrl))
				.Apply();
			return settings.IsValid;
		}

		public bool AllowedSetLogo(byte[] logo, string? contentType)
		{
			settings.Requires()
				.IsValid(OrganizationSettingsConstructorValidation.AllowedSetLogo(logo, contentType))
				.Apply();
			return settings.IsValid;
		}
	}

	public static class OrganizationSettingsConstructorValidation
	{
		// Mesma regra do front (organizationSettingsSchema.ts): dominio, com caminho opcional, sem protocolo.
		private const string WebsitePattern = @"^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(/.*)?$";

		public static Contract AllowedSave(string name, string? cnpj, string websiteUrl) =>
			new Contract().Requires()
				.HasLengthBetween(name, OrganizationSettings.NameMinLength, OrganizationSettings.NameMaxLength, Errors.OrganizationNameMinLength)
				.IsTrue(Cnpj.IsValid(cnpj), Errors.InvalidCnpj)
				.HasMaxLength(websiteUrl, OrganizationSettings.WebsiteMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.Website).AddArguments(OrganizationSettings.WebsiteMaxLength)
				.IsTrue(websiteUrl is not null && Regex.IsMatch(websiteUrl, WebsitePattern), Errors.InvalidWebsite)
				.Apply();

		/// <param name="contentType">Tipo detectado pela assinatura do arquivo; null quando nao e imagem conhecida.</param>
		public static Contract AllowedSetLogo(byte[] logo, string? contentType) =>
			new Contract().Requires()
				.IsTrue(logo.Length <= OrganizationSettings.LogoMaxBytes, Errors.LogoTooLarge)
					.StopOnFailure()
				.IsTrue(contentType is not null && OrganizationSettings.AllowedLogoContentTypes.Contains(contentType), Errors.InvalidLogoFormat)
				.Apply();
	}
}
