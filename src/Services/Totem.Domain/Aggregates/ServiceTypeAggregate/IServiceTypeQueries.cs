using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public interface IServiceTypeQueries
	{
		Task<List<ServiceTypeSummary>> GetActiveServicesAsync();
		Task<ServiceTypeView> GetByIdAsync(Guid id);
		Task<List<ServiceTypeSummary>> GetListAsync();
	}
}
