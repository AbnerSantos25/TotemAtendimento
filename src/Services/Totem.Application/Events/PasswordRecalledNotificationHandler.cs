using MediatR;
using Totem.Application.Events.Contracts;
using Totem.Application.Events.Notifications;

namespace Totem.Application.Events
{
    /// <summary>
    /// Reage ao PasswordRecalledEvent notificando o painel de atendimento que a senha
    /// foi chamada novamente no guichê (reconvocada).
    /// </summary>
    public sealed class PasswordRecalledNotificationHandler : INotificationHandler<PasswordRecalledEvent>
    {
        private readonly ISignalRNotifier _notifier;

        public PasswordRecalledNotificationHandler(ISignalRNotifier notifier)
        {
            _notifier = notifier;
        }

        public async Task Handle(PasswordRecalledEvent notification, CancellationToken cancellationToken)
        {
            await _notifier.NotifyPasswordRecalledAsync(
                notification.ServiceLocationId,
                notification.Code,
                notification.ServiceLocationName);
        }
    }
}
