using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    public record AssignNextPasswordRequestedEvent(Guid QueueId, Guid ServiceLocationId) : INotification;
}
