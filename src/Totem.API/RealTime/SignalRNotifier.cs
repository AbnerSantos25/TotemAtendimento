using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;
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

        public Task NotifyPasswordAssignedAsync(Guid serviceLocationId, int code, DateTime createdAt)
        {
            return _hub.Clients
                       .Group(serviceLocationId.ToString())
                       .SendAsync("NewPasswordAssigned", new { code, createdAt });
        }

    }

    public class PasswordHub : Hub
    {
        public async Task JoinLocation(string serviceLocationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, serviceLocationId);
        }
    }
}
