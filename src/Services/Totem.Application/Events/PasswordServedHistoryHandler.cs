using MediatR;
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

        public PasswordServedHistoryHandler(IPasswordHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
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
                    Console.WriteLine($"[ERROR] Falha ao salvar histórico da senha {notification.PasswordId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EXCEPTION] Erro ao persistir histórico: {ex.Message}");
            }
        }
    }
}
