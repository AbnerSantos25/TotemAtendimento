using MediatR;
using Totem.Domain.Aggregates.PasswordAggregate;

public class PasswordServiceLocationChangedHistoryEventHandler : INotificationHandler<PasswordServiceLocationChangedHistoryEvent>
{
	private readonly IPasswordHistoryRepository _historyRepository;

	public PasswordServiceLocationChangedHistoryEventHandler(IPasswordHistoryRepository historyRepository)
	{
		_historyRepository = historyRepository;
	}

	public async Task Handle(PasswordServiceLocationChangedHistoryEvent notification, CancellationToken cancellationToken)
	{
		try
		{

			var history = new PasswordHistory(
				notification.PasswordId,
				"Transferred",
				"Senha transferida para outro local de atendimento.",
				notification.OldServiceLocationId?.ToString(),
				notification.NewServiceLocationId?.ToString()
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