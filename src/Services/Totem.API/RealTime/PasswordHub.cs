using Microsoft.AspNetCore.SignalR;

namespace Totem.API.RealTime
{
    public class PasswordHub : Hub
    {
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
