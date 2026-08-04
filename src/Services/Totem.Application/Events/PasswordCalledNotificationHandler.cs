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
        private readonly ISignalRNotifier _signalRNotifier;

        public PasswordCalledNotificationHandler(ISignalRNotifier notifier)
        {
            _signalRNotifier = notifier;
        }

        public async Task Handle(PasswordCalledEvent notification, CancellationToken cancellationToken)
        {
			/// <summary>
			/// Notifica o guichê específico que uma senha foi atribuída a ele (matching automático)
			///</summary>
			await _signalRNotifier.NotifyPasswordAssignedAsync(
                notification.ServiceLocationId,
                notification.Code,
                DateTime.UtcNow);

			///<summary>
			///Notifica o front que houve alteração na senha.
			/// </summary>
			await _signalRNotifier.NotifyQueuePasswordUpdatedAsync(
                notification.QueueId,
                notification.Code,
                notification.Preferential,
                notification.ServiceLocationId,
                notification.ServiceLocationName,
                served: false);


			///<summary>
			/// Notifica que uma senha foi chamada.
			///</ summary >
			await _signalRNotifier.NotifyPasswordCalledAsync(
                notification.QueueId,
                notification.Code,
                notification.ServiceLocationName,
				notification.Preferential);
        }
	}
}
