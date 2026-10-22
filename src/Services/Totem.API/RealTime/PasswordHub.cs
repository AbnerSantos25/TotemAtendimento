using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Totem.Application.Services.QueueServices;
using Totem.Common.Localization.Resources;

namespace Totem.API.RealTime
{
    [Authorize]
    public class PasswordHub : Hub
    {
        private readonly IQueueServices _queueServices;

        public PasswordHub(IQueueServices queueServices)
        {
            _queueServices = queueServices;
        }

        internal static string QueueGroup(Guid queueId) => $"queue-{queueId}";

        internal static string QueueGroup(string queueId) => $"queue-{queueId}";

        /// <summary>
        /// Joins the SignalR group for the specified queue.
        /// Called by the attendant to receive new passwords in the waiting list.
        /// </summary>
        public async Task JoinQueue(string queueId)
        {
            if (!Guid.TryParse(queueId, out var id))
                throw new HubException(Errors.InvalidFormat);

            if (Context.User is not { } user || !await _queueServices.CanAccessQueueAsync(user, id))
                throw new HubException(Errors.QueueAccessDenied);

            await Groups.AddToGroupAsync(Context.ConnectionId, QueueGroup(queueId));
        }

        /// <summary>
        /// Leaves the SignalR group for the specified queue.
        /// </summary>
        public async Task LeaveQueue(string queueId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, QueueGroup(queueId));
        }

        /// <summary>
        /// Joins the SignalR group for the specified service location.
        /// Called by the attendant when they open the "Meu Guiche" screen.
        /// </summary>
        public async Task JoinServiceLocation(string serviceLocationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, serviceLocationId);
        }

        /// <summary>
        /// Leaves the SignalR group for the specified service location.
        /// Called when the attendant disconnects or changes their workstation.
        /// </summary>
        public async Task LeaveServiceLocation(string serviceLocationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, serviceLocationId);
        }
    }
}
