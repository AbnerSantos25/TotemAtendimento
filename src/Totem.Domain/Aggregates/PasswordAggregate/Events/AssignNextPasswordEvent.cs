using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    public record AssignNextPasswordEvent(Guid QueueId, Guid ServiceLocationId, string Name) : INotification;
}
