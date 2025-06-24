using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public interface IServiceLocationQueries
	{
		Task<ServiceLocationView> GetByIdAsync(Guid Id);
		Task<List<ServiceLocationSummary>> GetAllAsync();
	}
}
