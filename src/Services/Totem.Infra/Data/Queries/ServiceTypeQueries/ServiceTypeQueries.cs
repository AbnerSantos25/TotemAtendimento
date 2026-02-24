using Microsoft.EntityFrameworkCore;
using Totem.Domain.Aggregates.ServiceTypeAggregate;
using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.Infra.Data.Queries.ServiceTypeQueries
{
	public class ServiceTypeQueries : IServiceTypeQueries
	{
		private readonly TotemDbContext _dbContext;

		public ServiceTypeQueries(TotemDbContext dbContext)
		{
			_dbContext = dbContext;
		}

		public async Task<List<ServiceTypeSummary>> GetActiveServicesAsync()
		{
			var list = await _dbContext.ServiceTypes.Where(x => x.IsActive).Select(x => new ServiceTypeSummary
			{
				ServiceTypeId = x.Id,
				Title = x.Title,
				Icon = x.Icon,
				Color = x.Color.ToString(),
				TicketPrefix = x.TicketPrefix,
				TargetQueueId = x.TargetQueueId,
				IsActive = x.IsActive,
			}).ToListAsync();

			return list;
		}

		public async Task<ServiceTypeView> GetByIdAsync(Guid id)
		{
			var view =  await _dbContext.ServiceTypes.SingleOrDefaultAsync(x => x.Id == id);
			return view;
		}

		public async Task<List<ServiceTypeSummary>> GetListAsync()
		{
			return await _dbContext.ServiceTypes.Select(x => new ServiceTypeSummary
			{
				ServiceTypeId = x.Id,
				Title = x.Title,
				Icon = x.Icon,
				Color = x.Color.ToString(),
				TicketPrefix = x.TicketPrefix,
				TargetQueueId = x.TargetQueueId,
				IsActive = x.IsActive,
			}).ToListAsync();
		}
	}
}
