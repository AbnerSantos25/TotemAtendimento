using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using System.Security.Cryptography.Xml;


namespace Totem.Infra.Data.Repositories.ServiceLocationRepository
{
	public class ServiceLocationRepository : IServiceLocationRepository
	{
		private readonly TotemDbContext _context;
		public IUnitOfWork UnitOfWork => _context;

		public ServiceLocationRepository(TotemDbContext context)
		{
			_context = context;
		}

		public void Add(ServiceLocation serviceLocation)
		{
			_context.ServiceLocations.Add(serviceLocation);
		}

		public void Delete(ServiceLocation serviceLocation)
		{
			_context.ServiceLocations.Remove(serviceLocation);
		}

		public async Task<ServiceLocation> GetByIdAsync(Guid id)
		{
			return await _context.ServiceLocations.SingleOrDefaultAsync(x => x.Id == id);
		}

		public void Update(ServiceLocation serviceLocation)
		{
			_context.ServiceLocations.Update(serviceLocation);
		}

		public void Dispose()
		{
			_context.Dispose();
		}

		public async Task<bool> ExistsAsync(string Name, int? number)
		{
			var result = await _context.ServiceLocations.AsNoTracking().Where(x => x.Name == Name && x.Number == number).AnyAsync();
			return result;
		}
	}
}
