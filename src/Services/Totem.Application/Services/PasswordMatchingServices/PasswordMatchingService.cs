using MediatR;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.ServiceLocationAggregate.Events;

namespace Totem.Application.Services.PasswordMatchingServices
{

	public class PasswordMatchingService : BaseService, INotificationHandler<PasswordCreatedEvent>, INotificationHandler<ServiceLocationWaitingPasswordEvent>, IPasswordMatchingService
	{
		private readonly Dictionary<Guid, Queue<Guid>> _waitingPasswords = new();
		private readonly Dictionary<Guid, Queue<Guid>> _waitingLocations = new();

		private readonly IPasswordRepository _repo;
		private readonly IMediator _mediator;

		public PasswordMatchingService(INotificator notificador, IPasswordRepository repo, IMediator mediator) : base(notificador)
		{
			_repo = repo;
			_mediator = mediator;
		}

		private async Task<Result> TryMatch(Guid queueId, Guid id, bool isPassword)
		{
			var pwQueue = _waitingPasswords.GetOrAdd(queueId);
			var slQueue = _waitingLocations.GetOrAdd(queueId);

			if (isPassword)
				pwQueue.Enqueue(id);
			else
				slQueue.Enqueue(id);

			// enquanto houver senha E location na mesma fila, faça o match
			while (pwQueue.Count > 0 && slQueue.Count > 0)
			{
				var pwdId = pwQueue.Dequeue();
				var slId = slQueue.Dequeue();

				// busca a entidade Password, atribui o ServiceLocation e salva
				var pwd = await _repo.GetByIdAsync(pwdId);
				var oldServiceLocationId = pwd.ServiceLocationId;
				var oldServiceLocationName = pwd.ServiceLocation.Name;

				if (!pwd.CanBeReassigned)
				{
					return Unsuccessful(Errors.PasswordCannotBeTransfered);
				}

				pwd.AssignToServiceLocation(slId);
				_repo.Update(pwd);
				await _repo.UnitOfWork.CommitAsync();

				await _mediator.Publish(new PasswordCalledEvent(
					pwd.Id,
					pwd.QueueId,
					slId,
					pwd.ServiceLocation.Name,
					oldServiceLocationId,
					oldServiceLocationName,
					pwd.Code,
					pwd.Preferential));

				//await _mediator.Publish(new PasswordServiceLocationChangedHistoryEvent(pwd.Id, oldServiceLocationId, slId, oldServiceLocationName, pwd.ServiceLocation.Name, pwd.Code));
				//await _notifier.NotifyPasswordAssignedAsync(slId, pwd.Code, pwd.CreatedAt);
				//await _notifier.NotifyPasswordCalledAsync(pwd.QueueId, pwd.Code, pwd.ServiceLocation.Name, pwd.Preferential);
			}
			return Successful();
		}

		public async Task Handle(PasswordCreatedEvent evt, CancellationToken _) =>
			await TryMatch(evt.QueueId, evt.PasswordId, isPassword: true);

		public async Task Handle(ServiceLocationWaitingPasswordEvent evt, CancellationToken _) =>
			await TryMatch(evt.QueueId, evt.ServiceLocationId, isPassword: false);
	}

	static class DictExtensions
	{
		public static Queue<T> GetOrAdd<K, T>(this Dictionary<K, Queue<T>> dict, K key)
		{
			if (!dict.TryGetValue(key, out var q))
			{
				q = new Queue<T>();
				dict[key] = q;
			}
			return q;
		}
	}
}
