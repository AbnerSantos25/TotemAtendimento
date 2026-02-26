using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public interface IServiceTypeQueires
	{
		Task<List<ServiceTypeSummary>> GetActiveServicesAsync();
		Task<ServiceTypeView> GetByIdAsync(Guid id);
		Task<List<ServiceTypeSummary>> GetListAsync();
	}
}
