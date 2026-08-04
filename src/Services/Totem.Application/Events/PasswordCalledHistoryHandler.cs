using MediatR;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
    /// <summary>
    /// Reage ao PasswordCalledEvent gravando o histórico da chamada no banco de dados.
    /// Responsabilidade única: persistência do histórico.
    /// </summary>
    public sealed class PasswordCalledHistoryHandler : INotificationHandler<PasswordCalledEvent>
    {
        private readonly IPasswordHistoryRepository _historyRepository;

        public PasswordCalledHistoryHandler(IPasswordHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
        }

        public async Task Handle(PasswordCalledEvent notification, CancellationToken cancellationToken)
        {
            try
            {
                var description = string.Format(
                    Messages.HistoryTransferred,
                    notification.Code,
                    notification.OldServiceLocationName,
                    notification.ServiceLocationName
                );

                var history = new PasswordHistory(
                    notification.PasswordId,
                    PasswordHistoryEventType.Transferred,
                    description,
                    notification.OldServiceLocationId?.ToString(),
                    notification.ServiceLocationId.ToString()
                );

                await _historyRepository.AddAsync(history);

                var success = await _historyRepository.UnitOfWork.CommitAsync();

				//TODO: (Abner) https://github.com/AbnerSantos25/TotemAtendimento/issues/129
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
