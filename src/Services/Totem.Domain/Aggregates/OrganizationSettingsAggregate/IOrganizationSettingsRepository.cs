using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.OrganizationSettingsAggregate
{
	public interface IOrganizationSettingsRepository : IRepository<OrganizationSettings>
	{
		void Add(OrganizationSettings organizationSettings);

		void Update(OrganizationSettings organizationSettings);

		Task<OrganizationSettings?> GetAsync();
	}
}
