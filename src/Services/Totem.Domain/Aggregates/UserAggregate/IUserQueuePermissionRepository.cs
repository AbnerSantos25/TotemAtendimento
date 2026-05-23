using Totem.Common.Data;

namespace Totem.Domain.Aggregates.UserAggregate
{
	public interface IUserQueuePermissionRepository : IDisposable
	{
		IUnitOfWork UnitOfWork { get; }
		Task<List<Guid>> GetAllowedQueueIdsAsync(Guid userId);
		Task<bool> HasPermissionAsync(Guid userId, Guid queueId);
		Task SetPermissionsAsync(Guid userId, List<Guid> queueIds);
	}
}
