using MediatR;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
	public class PasswordMarkedAsServedEventHandler : INotificationHandler<PasswordMarkedAsServedEvent>
	{
		private readonly IPasswordHistoryRepository _historyRepository;

		public PasswordMarkedAsServedEventHandler(IPasswordHistoryRepository historyRepository)
		{
			_historyRepository = historyRepository;
		}

		public async Task Handle(PasswordMarkedAsServedEvent notification, CancellationToken cancellationToken)
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
					// LOG: CommitAsync falhou
					// Pode usar ILogger aqui
					Console.WriteLine($"[ERROR] Falha ao salvar histórico da senha {notification.PasswordId}");
				}
			}
			catch (Exception ex)
			{
				// LOG de erro com stack trace
				Console.WriteLine($"[EXCEPTION] Erro ao persistir histórico: {ex.Message}");
			}


		}
	}

}
