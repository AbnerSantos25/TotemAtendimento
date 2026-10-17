using FluentValidation;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	public class OrganizationSettingsValidator : AbstractValidator<OrganizationSettings>
	{
		// Mesma regra do front (organizationSettingsSchema.ts): dominio, com caminho opcional, sem protocolo.
		private const string WebsitePattern = @"^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(/.*)?$";

		public OrganizationSettingsValidator()
		{
			RuleFor(x => x.Name)
				.NotEmpty()
				.Length(3, 100)
				.WithMessage(Errors.OrganizationNameMinLength);

			RuleFor(x => x.WebsiteUrl)
				.NotEmpty()
				.MaximumLength(255)
				.Matches(WebsitePattern)
				.WithMessage(Errors.InvalidWebsite);
		}
	}
}
