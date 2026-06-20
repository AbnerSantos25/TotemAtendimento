using Microsoft.AspNetCore.SignalR;
using Totem.Application.Events.Notifications;

namespace Totem.API.RealTime
{
    public class SignalRNotifier : IRealTimeNotifier
    {
        private readonly IHubContext<PasswordHub> _hub;

        public SignalRNotifier(IHubContext<PasswordHub> hub)
        {
            _hub = hub;
        }

        public Task NotifyPasswordCreatedAsync(Guid queueId, int code, DateTime createdAt, bool preferential)
        {
            return _hub.Clients
                       .Group(PasswordHub.QueueGroup(queueId))
                       .SendAsync("PasswordCreated", new { code, createdAt, preferential });
        }

        public Task NotifyPasswordAssignedAsync(Guid serviceLocationId, int code, DateTime createdAt)
        {
            return _hub.Clients
                       .Group(serviceLocationId.ToString())
                       .SendAsync("NewPasswordAssigned", new { code, createdAt });
        }

        public Task NotifyPasswordCalledAsync(Guid serviceLocationId, int code, string patientName)
        {
            return _hub.Clients
                       .Group(serviceLocationId.ToString())
                       .SendAsync("PasswordCalled", new { code, patientName });
        }

        public Task NotifyPasswordRecalledAsync(Guid serviceLocationId, int code, string patientName)
        {
            return _hub.Clients
                       .Group(serviceLocationId.ToString())
                       .SendAsync("PasswordRecalled", new { code, patientName });
        }

        public Task NotifyPasswordServedAsync(Guid serviceLocationId, int code)
        {
            return _hub.Clients
                       .Group(serviceLocationId.ToString())
                       .SendAsync("PasswordServed", new { code });
        }

        public Task NotifyQueuePasswordUpdatedAsync(Guid queueId, int code, bool preferential, Guid serviceLocationId, string serviceLocationName, bool served)
        {
            return _hub.Clients
                       .Group($"queue-{queueId}")
                       .SendAsync("QueuePasswordUpdated", new
                       {
                           code,
                           preferential,
                           serviceLocationId,
                           serviceLocationName,
                           served
                       });
        }
    }
}
