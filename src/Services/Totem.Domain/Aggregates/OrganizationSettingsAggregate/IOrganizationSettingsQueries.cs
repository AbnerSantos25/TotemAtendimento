using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	public interface IOrganizationSettingsQueries
	{
		Task<OrganizationSettingsView?> GetAsync();

		Task<OrganizationLogo?> GetLogoAsync();
	}
}
