using MediatR;
using Microsoft.Extensions.Logging;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
    /// <summary>
    /// Reage ao PasswordServedEvent gravando o histórico de atendimento no banco de dados.
    /// Responsabilidade única: persistência do histórico.
    /// </summary>
    public sealed class PasswordServedHistoryHandler : INotificationHandler<PasswordServedEvent>
    {
        private readonly IPasswordHistoryRepository _historyRepository;
        private readonly ILogger<PasswordServedHistoryHandler> _logger;

        public PasswordServedHistoryHandler(IPasswordHistoryRepository historyRepository, ILogger<PasswordServedHistoryHandler> logger)
        {
            _historyRepository = historyRepository;
            _logger = logger;
        }

        public async Task Handle(PasswordServedEvent notification, CancellationToken cancellationToken)
        {
            var description = string.Format(
                Messages.HistoryServed,
                notification.Code
            );

            try
            {
                var history = new PasswordHistory(
                    notification.PasswordId,
                    PasswordHistoryEventType.Served,
                    description,
                    null,
                    PasswordHistoryEventType.Served.ToString()
                );

                await _historyRepository.AddAsync(history);

                var success = await _historyRepository.UnitOfWork.CommitAsync();
                if (!success)
                    _logger.LogError("Falha ao salvar o historico da senha {PasswordId}.", notification.PasswordId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao persistir o historico da senha {PasswordId}.", notification.PasswordId);
            }
        }
    }
}
