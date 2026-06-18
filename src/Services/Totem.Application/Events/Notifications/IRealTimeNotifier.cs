namespace Totem.Application.Events.Notifications
{
    public interface IRealTimeNotifier
    {
        /// <summary>
        /// Notifies when a new password is created and added to the waiting queue.
        /// </summary>
        Task NotifyPasswordCreatedAsync(Guid queueId, int code, DateTime createdAt, bool preferential);

        /// <summary>
        /// Notifies when a new password is assigned to a service location (guichê) by the matching engine.
        /// </summary>
        Task NotifyPasswordAssignedAsync(Guid serviceLocationId, int code, DateTime createdAt);

        /// <summary>
        /// Notifies when an attendant calls the next password at their workstation.
        /// </summary>
        Task NotifyPasswordCalledAsync(Guid serviceLocationId, int code, string patientName);

        /// <summary>
        /// Notifies when an attendant re-calls the current password at their workstation.
        /// </summary>
        Task NotifyPasswordRecalledAsync(Guid serviceLocationId, int code, string patientName);

        /// <summary>
        /// Notifies when a password has been marked as served/completed.
        /// </summary>
        Task NotifyPasswordServedAsync(Guid serviceLocationId, int code);
    }
}
