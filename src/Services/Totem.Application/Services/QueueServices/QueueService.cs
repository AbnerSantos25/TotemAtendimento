using System.Security.Claims;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Models.QueueModels;
using Totem.Application.Services.PasswordMatchingServices;
namespace Totem.Application.Services.QueueServices
{
	public class QueueService : BaseService, IQueueServices
	{
		private readonly IQueueRepository _repository;
		private readonly IQueueQueries _queries;
		private readonly IUserQueuePermissionRepository _permissionRepository;
		private readonly IWaitingServiceLocationStore _waitingLocations;

		public QueueService(INotificator notificador, IQueueRepository repository, IQueueQueries queries, IUserQueuePermissionRepository permissionRepository, IWaitingServiceLocationStore waitingLocations) : base(notificador)
		{
			_repository = repository;
			_queries = queries;
			_permissionRepository = permissionRepository;
			_waitingLocations = waitingLocations;
		}

		public async Task<(Result result, Guid data)> AddAsync(QueueRequest request)
		{
			if (request == null)
				return Unsuccessful<Guid>();

			var contract = QueueConstructorValidation.AllowedAdd(request.Name);
			if (!contract.IsValid)
				return Unsuccessful<Guid>(contract);

			if (await _repository.ExistsAsync(request.Name))
				return Unsuccessful<Guid>(Errors.RegisterAlreadyExists);

			var queue = new Queue(request.Name, request.IsActive);

			_repository.Add(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful<Guid>(Errors.ErrorSavingDatabase);

			return Successful(queue.Id);
		}

		public async Task<Result> UpdateAsync(Guid Id, QueueRequest request)
		{
			var queue = await _repository.GetByIdAsync(Id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);

			if (!queue.Validations.AllowedUpdate(request.Name))
				return Unsuccessful(queue);

			if (await _repository.ExistsAsync(request.Name))
				return Unsuccessful(Errors.RegisterAlreadyExists);

			queue.Update(request.Name);

			_repository.Update(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();

		}

		public async Task<Result> DeleteAsync(Guid id)
		{
			var queue = await _repository.GetByIdAsync(id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);

			_repository.Delete(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			_waitingLocations.ClearQueue(id);

			return Successful();

		}

		public async Task<(Result result, QueueView data)> GetByIdAsync(Guid id)
		{
			var queues = await _queries.GetByIdAsync(id);

			if (queues == null)
				return Unsuccessful<QueueView>(Errors.NotFound);

			return Successful(queues);
		}

		public async Task<(Result result, List<QueueSummary> data)> GetListAsync()
		{
			return Successful(await _queries.GetListAsync());
		}

		public async Task<(Result result, List<QueueSummary> data)> GetListByPermissionAsync(ClaimsPrincipal caller)
		{
			if (SeesAllQueues(caller))
				return await GetListAsync();

			// Sem id valido nao ha permissao a consultar: nega por padrao.
			if (caller.GetUserId() is not Guid userId)
				return Successful(new List<QueueSummary>());

			var allowedQueueIds = await _permissionRepository.GetAllowedQueueIdsAsync(userId);
			
			if (allowedQueueIds.Count == 0)
				return Successful(new List<QueueSummary>());
			
			var queues = await _queries.GetListByIdsAsync(allowedQueueIds);

			return Successful(queues);
		}

		public async Task<bool> CanAccessQueueAsync(ClaimsPrincipal caller, Guid queueId) =>
			SeesAllQueues(caller)
			|| (caller.GetUserId() is Guid userId && await _permissionRepository.HasPermissionAsync(userId, queueId));

		// Admin, Manager e System veem todas as filas; os demais, so as liberadas em UserQueuePermission.
		private static bool SeesAllQueues(ClaimsPrincipal caller) =>
			caller.IsInRole(nameof(Role.Admin)) || caller.IsInRole(nameof(Role.Manager)) || caller.IsInRole(nameof(Role.System));

		public async Task<Result> ToggleStatusQueue(Guid id)
		{
			var queue = await _repository.GetByIdAsync(id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);

			queue.ToggleStatus();

			_repository.Update(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			// Fila desativada nao pode manter guiches esperando senha que nao sera mais gerada.
			if (!queue.IsActive)
				_waitingLocations.ClearQueue(id);

			return Successful();


		}
	}
}
