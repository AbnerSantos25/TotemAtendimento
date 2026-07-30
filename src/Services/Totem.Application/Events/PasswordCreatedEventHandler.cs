using MediatR;
using Totem.Application.Events.Notifications;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

namespace Totem.Application.Events
{
    public sealed class PasswordCreatedEventHandler : INotificationHandler<PasswordCreatedEvent>
    {
        private readonly ISignalRNotifier _notifier;

        public PasswordCreatedEventHandler(ISignalRNotifier notifier)
        {
            _notifier = notifier;
        }

        public async Task Handle(PasswordCreatedEvent notification, CancellationToken cancellationToken)
        {
            await _notifier.NotifyPasswordCreatedAsync(
                notification.QueueId,
                notification.Code,
                notification.CreatedAt,
                notification.Preferential);
        }
    }
}
