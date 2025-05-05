using MediatR;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
	public class PasswordMarkedAsServedEventHandler : INotificationHandler<PasswordMarkedAsServedHistoryEvent>
	{
		private readonly IPasswordHistoryRepository _historyRepository;

		public PasswordMarkedAsServedEventHandler(IPasswordHistoryRepository historyRepository)
		{
			_historyRepository = historyRepository;
		}

		public async Task Handle(PasswordMarkedAsServedHistoryEvent notification, CancellationToken cancellationToken)
		{
			try
			{
				var history = new PasswordHistory(
				notification.PasswordId,
				"Served",
				"Senha marcada como atendida.",
				"Waiting",
				"Served"
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
