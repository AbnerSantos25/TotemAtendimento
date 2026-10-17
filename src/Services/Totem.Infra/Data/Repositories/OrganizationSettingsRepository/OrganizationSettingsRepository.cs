using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;

namespace Totem.Infra.Data.Repositories.OrganizationSettingsRepository
{
	public class OrganizationSettingsRepository : IOrganizationSettingsRepository
	{
		private readonly TotemDbContext _context;
		public IUnitOfWork UnitOfWork => _context;

		public OrganizationSettingsRepository(TotemDbContext context)
		{
			_context = context;
		}

		public void Add(OrganizationSettings organizationSettings)
		{
			_context.OrganizationSettings.Add(organizationSettings);
		}

		public void Update(OrganizationSettings organizationSettings)
		{
			_context.OrganizationSettings.Update(organizationSettings);
		}

		public async Task<OrganizationSettings?> GetAsync()
		{
			return await _context.OrganizationSettings.SingleOrDefaultAsync();
		}

		public void Dispose()
		{
			_context.Dispose();
		}
	}
}
