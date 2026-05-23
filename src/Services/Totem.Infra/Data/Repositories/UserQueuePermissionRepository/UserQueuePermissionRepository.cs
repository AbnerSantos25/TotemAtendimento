using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Infra.Data.IdentityData;

namespace Totem.Infra.Data.Repositories.UserQueuePermissionRepository
{
	public class UserQueuePermissionRepository : IUserQueuePermissionRepository
	{
		private readonly AppIdentityDbContext _context;

		public IUnitOfWork UnitOfWork => _context;

		public UserQueuePermissionRepository(AppIdentityDbContext context)
		{
			_context = context;
		}

		public async Task<List<Guid>> GetAllowedQueueIdsAsync(Guid userId)
		{
			return await _context.UserQueuePermissions
				.Where(x => x.UserId == userId)
				.Select(x => x.QueueId)
				.ToListAsync();
		}

		public async Task<bool> HasPermissionAsync(Guid userId, Guid queueId)
		{
			return await _context.UserQueuePermissions
				.AnyAsync(x => x.UserId == userId && x.QueueId == queueId);
		}

		public async Task SetPermissionsAsync(Guid userId, List<Guid> queueIds)
		{
			var currentPermissions = await _context.UserQueuePermissions
				.Where(x => x.UserId == userId)
				.ToListAsync();

			_context.UserQueuePermissions.RemoveRange(currentPermissions);

			var newPermissions = queueIds.Select(q => new UserQueuePermission(userId, q)).ToList();
			await _context.UserQueuePermissions.AddRangeAsync(newPermissions);
		}

		public void Dispose()
		{
			_context.Dispose();
		}
	}
}
