using Microsoft.EntityFrameworkCore;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Infra.Data.Queries.ServiceLocationQueries
{
	public class ServiceLocationQueries : IServiceLocationQueries
	{
		private readonly TotemDbContext _context;
		public ServiceLocationQueries(TotemDbContext context)
		{
			_context = context;
		}
		public async Task<List<ServiceLocationSummary>> GetAllAsync()
		{
			var list = await _context.ServiceLocations
							.AsNoTracking()
							.ToListAsync();

			List<ServiceLocationSummary> serviceLocationSummaries = list
						.Select(x => new ServiceLocationSummary
						{
							Id = x.Id,
							Name = x.Name,
							Number = x.Number
						}).ToList();

			return serviceLocationSummaries;
		}

		public async Task<ServiceLocationView> GetByIdAsync(Guid Id)
		{
			return await _context.ServiceLocations.SingleOrDefaultAsync(x => x.Id == Id);
		}
	}
}
