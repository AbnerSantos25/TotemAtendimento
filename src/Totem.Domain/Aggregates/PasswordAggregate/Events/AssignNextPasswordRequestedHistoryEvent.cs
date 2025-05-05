using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    public record AssignNextPasswordRequestedHistoryEvent(Guid QueueId, Guid ServiceLocationId) : INotification;
}
