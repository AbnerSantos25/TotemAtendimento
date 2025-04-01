using Totem.Common.Services;
using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Application.Services.ServiceLocationServices
{
	public interface IServiceLocationService
	{
		Task<(Result result, List<ServiceLocationSummary> data)> GetListAsync();
		Task<ServiceLocationView> GetByIdAsync(Guid Id);
		Task<Result> AddAsync(ServiceLocationRequest request);
		Task<Result> UpdateAsync(Guid Id,ServiceLocationRequest request);
		Task<Result> DeleteAsync(Guid Id);
	}
}
