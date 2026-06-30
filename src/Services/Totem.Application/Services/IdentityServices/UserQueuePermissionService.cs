using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
	public class UserQueuePermissionService : BaseService, IUserQueuePermissionService
	{
		private readonly IUserQueuePermissionRepository _permissionRepository;
		private readonly IQueueRepository _queueRepository;

		public UserQueuePermissionService(
			INotificator notificator, 
			IUserQueuePermissionRepository permissionRepository,
			IQueueRepository queueRepository) : base(notificator)
		{
			_permissionRepository = permissionRepository;
			_queueRepository = queueRepository;
		}

		public async Task<(Result result, List<Guid> data)> GetAllowedQueueIdsAsync(Guid userId)
		{
			var queueIds = await _permissionRepository.GetAllowedQueueIdsAsync(userId);
			return Successful(queueIds);
		}

		public async Task<Result> SetPermissionsAsync(Guid userId, SetUserQueuePermissionsRequest request)
		{
			foreach (var queueId in request.QueueIds)
			{
				var queue = await _queueRepository.GetByIdAsync(queueId);
				if (queue == null)
				{
					return Unsuccessful(Errors.NotFound);
				}
			}

			await _permissionRepository.SetPermissionsAsync(userId, request.QueueIds);

			if (!await _permissionRepository.UnitOfWork.CommitAsync())
			{
				return Unsuccessful(Errors.ErrorSavingDatabase);
			}

			return Successful();
		}
	}
}
