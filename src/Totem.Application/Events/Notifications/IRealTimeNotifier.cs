namespace Totem.Application.Events.Notifications
{
    public interface IRealTimeNotifier
    {
        Task NotifyPasswordAssignedAsync(Guid serviceLocationId, int code, DateTime createdAt);
    }
}
