using MediatR;
using Microsoft.Extensions.Logging;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
	public class PasswordQueueChangedEventHandler : INotificationHandler<PasswordQueueChangedEvent>
	{
		private readonly IPasswordHistoryRepository _historyRepository;
		private readonly ILogger<PasswordQueueChangedEventHandler> _logger;

		public PasswordQueueChangedEventHandler(IPasswordHistoryRepository historyRepository, ILogger<PasswordQueueChangedEventHandler> logger)
		{
			_historyRepository = historyRepository;
			_logger = logger;
		}

		public async Task Handle(PasswordQueueChangedEvent notification, CancellationToken cancellationToken)
		{
			try
			{
				var description = string.Format(
				  Messages.HistoryQueueChanged,
				  notification.Code,
				  notification.OldDescription,
				  notification.NewDescription
				);

				var history = new PasswordHistory(
					notification.PasswordId,
					PasswordHistoryEventType.QueueChanged,
					description,
					notification.OldQueueId.ToString(),
					notification.NewQueueId.ToString()
				);

				await _historyRepository.AddAsync(history);
				var success = await _historyRepository.UnitOfWork.CommitAsync();
				if (!success)
				{
					_logger.LogError("Falha ao salvar o historico da senha {PasswordId}.", notification.PasswordId);
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Erro ao persistir o historico da senha {PasswordId}.", notification.PasswordId);
			}
		}
	}
}