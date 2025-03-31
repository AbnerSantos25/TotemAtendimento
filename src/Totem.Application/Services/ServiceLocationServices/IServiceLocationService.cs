using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Application.Services.ServiceLocationServices
{
	public interface IServiceLocationService
	{
		Task<(bool Success, List<ServiceLocationSummary> data)> GetListAsync();
		Task<ServiceLocationView> GetByIdAsync(Guid Id);
		Task<bool> AddAsync(ServiceLocationRequest request);
		Task<bool> UpdateAsync(ServiceLocationRequest request);
		Task<bool> DeleteAsync(Guid Id);
	}
}
