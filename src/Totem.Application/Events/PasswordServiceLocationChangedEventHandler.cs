using MediatR;
using Totem.Domain.Aggregates.PasswordAggregate;

public class PasswordServiceLocationChangedEventHandler : INotificationHandler<PasswordServiceLocationChangedEvent>
{
	private readonly IPasswordHistoryRepository _historyRepository;

	public PasswordServiceLocationChangedEventHandler(IPasswordHistoryRepository historyRepository)
	{
		_historyRepository = historyRepository;
	}

	public async Task Handle(PasswordServiceLocationChangedEvent notification, CancellationToken cancellationToken)
	{
		var history = new PasswordHistory(
			notification.PasswordId,
			"Transferred",
			"Senha transferida para outro local de atendimento.",
			notification.OldServiceLocationId?.ToString(),
			notification.NewServiceLocationId?.ToString()
		);

		await _historyRepository.AddAsync(history);
		await _historyRepository.UnitOfWork.CommitAsync();
	}
}
