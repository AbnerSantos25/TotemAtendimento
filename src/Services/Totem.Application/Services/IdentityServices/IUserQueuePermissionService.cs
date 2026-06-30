using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
	public interface IUserQueuePermissionService
	{
		Task<(Result result, List<Guid> data)> GetAllowedQueueIdsAsync(Guid userId);
		Task<Result> SetPermissionsAsync(Guid userId, SetUserQueuePermissionsRequest request);
	}
}
