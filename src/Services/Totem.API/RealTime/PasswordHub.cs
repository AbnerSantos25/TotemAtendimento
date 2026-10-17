using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.UserAggregate;

namespace Totem.API.RealTime
{
    [Authorize]
    public class PasswordHub : Hub
    {
        private readonly IUserQueuePermissionRepository _permissionRepository;

        public PasswordHub(IUserQueuePermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
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

            if (!await CanAccessQueueAsync(id))
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

        /// <summary>
        /// Mirrors QueueService.GetListByPermissionAsync: Admin, Manager and System
        /// see every queue; the remaining users only the ones explicitly granted.
        /// </summary>
        private async Task<bool> CanAccessQueueAsync(Guid queueId)
        {
            var user = Context.User;
            if (user is null)
                return false;

            if (user.IsInRole(nameof(Role.Admin))
                || user.IsInRole(nameof(Role.Manager))
                || user.IsInRole(nameof(Role.System)))
            {
                return true;
            }

            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");

            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return false;

            return await _permissionRepository.HasPermissionAsync(userId, queueId);
        }
    }
}
