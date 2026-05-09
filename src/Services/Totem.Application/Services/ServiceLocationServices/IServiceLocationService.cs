using Totem.Common.Services;
using Totem.Domain.Models.ServiceLocationModels;
using Totem.SharedKernel.Models;

namespace Totem.Application.Services.ServiceLocationServices
{
	public interface IServiceLocationService
	{
		Task<(Result result, List<ServiceLocationSummary> data)> GetListAsync();
		Task<(Result result, ServiceLocationView data)> GetByIdAsync(Guid Id);
		Task<(Result result, Guid data)> AddAsync(ServiceLocationRequest request);
		Task<Result> UpdateAsync(Guid Id, ServiceLocationRequest request);
		Task<Result> DeleteAsync(Guid Id);

		Task<(Result result, IPasswordView data)> ServiceLocationReadyAsync(Guid serviceLocationId, ServiceLocationReadyRequest request);

		/// <summary>Notifies all clients in the service location group to re-display the current password on the panel.</summary>
		Task<Result> RecallCurrentPasswordAsync(Guid serviceLocationId);

	}
}
