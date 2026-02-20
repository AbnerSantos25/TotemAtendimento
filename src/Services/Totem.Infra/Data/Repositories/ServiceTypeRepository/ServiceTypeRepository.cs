using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.ServiceTypeAggregate;

namespace Totem.Infra.Data.Repositories.ServiceTypeRepository
{
	public class ServiceTypeRepository : IServiceTypeRepository
	{
		private readonly TotemDbContext _dbContext;

		public ServiceTypeRepository(TotemDbContext dbContext)
		{
			_dbContext = dbContext;
		}

		public IUnitOfWork UnitOfWork => _dbContext;

		public void Add(ServiceType serviceType)
		{
			_dbContext.Add(serviceType);
		}

		public void Delete(ServiceType serviceType)
		{
			_dbContext.Remove(serviceType);
		}

		public async Task<bool> ExistsAsync(Guid queueId, string title, string ticketPrefix)
		{
			return await _dbContext.ServiceTypes.AnyAsync(x => (x.TargetQueueId == queueId && x.Title == title) || x.TicketPrefix == ticketPrefix);
		}

		public async Task<ServiceType> GetByIdAsync(Guid id)
		{
			return await _dbContext.ServiceTypes.SingleOrDefaultAsync(x => x.Id == id);
		}

		public void Update(ServiceType serviceType)
		{
			_dbContext.Update(serviceType);
		}

		public void Dispose()
		{
			_dbContext.Dispose();
		}
	}
}
