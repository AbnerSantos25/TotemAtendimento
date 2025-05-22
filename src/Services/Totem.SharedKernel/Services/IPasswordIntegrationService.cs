using Totem.SharedKernel.Models;

namespace Totem.SharedKernel.Services
{
	public interface IPasswordIntegrationService
	{
		Task<( Result result, IPasswordView data)> ServiceLocationWaitingPasswordAsync(Guid queueId, Guid serviceLocationId, string newServiceLocationName);
	}
}
