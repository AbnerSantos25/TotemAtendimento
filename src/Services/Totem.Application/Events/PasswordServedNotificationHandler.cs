using MediatR;
using Totem.Application.Events.Notifications;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
    /// <summary>
    /// Reage ao PasswordServedEvent disparando as notificações SignalR de atendimento concluído.
    /// Responsabilidade única: notificação de infraestrutura (WebSocket).
    /// </summary>
    public sealed class PasswordServedNotificationHandler : INotificationHandler<PasswordServedEvent>
    {
        private readonly ISignalRNotifier _notifier;

        public PasswordServedNotificationHandler(ISignalRNotifier notifier)
        {
            _notifier = notifier;
        }

        public async Task Handle(PasswordServedEvent notification, CancellationToken cancellationToken)
        {
            // Notifica o guichê que atendeu que a senha foi concluída
            await _notifier.NotifyPasswordServedAsync(
                notification.ServiceLocationId,
                notification.Code);

            // Notifica TODOS os atendentes da fila para que removam a senha do painel "Em Atendimento"
            await _notifier.NotifyQueuePasswordUpdatedAsync(
                notification.QueueId,
                notification.Code,
                notification.Preferential,
                notification.ServiceLocationId,
                notification.ServiceLocationName,
                served: true);
        }
    }
}
