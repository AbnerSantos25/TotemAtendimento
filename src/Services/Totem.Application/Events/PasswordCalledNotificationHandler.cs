using MediatR;
using Totem.Application.Events.Notifications;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
    /// <summary>
    /// Reage ao PasswordCalledEvent notificando todos os atendentes da fila em tempo real via SignalR.
    /// Responsabilidade única: notificação de infraestrutura (WebSocket).
    /// </summary>
    public sealed class PasswordCalledNotificationHandler : INotificationHandler<PasswordCalledEvent>
    {
        private readonly ISignalRNotifier _notifier;

        public PasswordCalledNotificationHandler(ISignalRNotifier notifier)
        {
            _notifier = notifier;
        }

        public async Task Handle(PasswordCalledEvent notification, CancellationToken cancellationToken)
        {
            // Notifica o guichê específico que uma senha foi atribuída a ele (matching automático)
            await _notifier.NotifyPasswordAssignedAsync(
                notification.ServiceLocationId,
                notification.Code,
                DateTime.UtcNow);

            // Notifica TODOS os atendentes da fila para que atualizem o painel em tempo real
            await _notifier.NotifyQueuePasswordUpdatedAsync(
                notification.QueueId,
                notification.Code,
                notification.Preferential,
                notification.ServiceLocationId,
                notification.ServiceLocationName,
                served: false);
        }
    }
}
