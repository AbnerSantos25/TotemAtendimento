using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.Application.Services.ServiceTypeServices
{
	public interface IServiceTypeService
	{
		Task<(Result result, ServiceTypeView data)> GetByIdAsync(Guid id);
		Task<(Result result, List<ServiceTypeSummary> data)> GetActiveServicesAsync();
		Task<(Result result, List<ServiceTypeSummary> data)> GetAllAsync();
		Task<(Result result, Guid data)> CreateAsync(ServiceTypeRequest request);
		Task<Result> UpdateAsync(Guid id, ServiceTypeRequest request);
		Task<Result> ToggleStatusAsync(Guid id);
		Task<Result> DisableAsync(Guid id);
	}
}