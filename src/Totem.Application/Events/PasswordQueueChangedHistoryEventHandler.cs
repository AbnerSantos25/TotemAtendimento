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
			try
			{

				var history = new PasswordHistory(
					notification.PasswordId,
					"QueueChanged",
					"Senha transferida para outra fila.",
					notification.OldQueueId.ToString(),
					notification.NewQueueId.ToString()
				);

				await _historyRepository.AddAsync(history);
				var success = await _historyRepository.UnitOfWork.CommitAsync();
				if (!success)
				{
					Console.WriteLine($"[ERROR] Falha ao salvar histórico da senha {notification.PasswordId}");
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[EXCEPTION] Erro ao persistir histórico: {ex.Message}");
			}
		}
	}
}