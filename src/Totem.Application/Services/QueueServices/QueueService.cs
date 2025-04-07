using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Models.QueueModels;

namespace Totem.Application.Services.QueueServices
{
	public class QueueService : BaseService, IQueueServices
	{
		private readonly IQueueRepository _repository;
		private readonly IQueueQueries _queries;

		public QueueService(INotificador notificador, IQueueRepository repository, IQueueQueries queries) : base(notificador)
		{
			_repository = repository;
			_queries = queries;
		}

		public async Task<Result> AddAsync(QueueRequest request)
		{
			if (request == null)
				return Unsuccessful();

			var queueValidator = new QueueValidator();

			var queue = new Queue(request.Name);

			if (!queueValidator.Validate(queue).IsValid)
				return Unsuccessful();

			if (await _repository.ExistsAsync(request.Name))
				return Unsuccessful(Errors.RegisterAlreadyExists);

			_repository.Add(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<Result> UpdateAsync(Guid Id, QueueRequest request)
		{
			var queueValidator = new QueueValidator();
			if (!queueValidator.Validate(new Queue(request.Name)).IsValid)
				return Unsuccessful();

			var queue = await _repository.GetByIdAsync(Id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);

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

		public async Task<Result> DisableQueue(Guid id)
		{
			var queue = await _repository.GetByIdAsync(id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);


			queue.ChangeStatus(false);

			_repository.Update(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<Result> EnableQueue(Guid id)
		{
			var queue = await _repository.GetByIdAsync(id);

			if (queue == null)
				return Unsuccessful(Errors.NotFound);

			queue.ChangeStatus(true);

			_repository.Update(queue);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}
	}
}
