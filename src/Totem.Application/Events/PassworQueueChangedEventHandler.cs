using MediatR;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
	public class PasswordQueueChangedEventHandler : INotificationHandler<PasswordQueueChangedEvent>
	{
		private readonly IPasswordHistoryRepository _historyRepository;

		public PasswordQueueChangedEventHandler(IPasswordHistoryRepository historyRepository)
		{
			_historyRepository = historyRepository;
		}

		public async Task Handle(PasswordQueueChangedEvent notification, CancellationToken cancellationToken)
		{
			var history = new PasswordHistory(
				notification.PasswordId,
				"QueueChanged",
				"Senha transferida para outra fila.",
				notification.OldQueueId.ToString(),
				notification.NewQueueId.ToString()
			);

			await _historyRepository.AddAsync(history);
			await _historyRepository.UnitOfWork.CommitAsync();
		}
	}
}
