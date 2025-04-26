using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    public record AssignNextPasswordDomainEvent(Guid QueueId, Guid ServiceLocationId) : INotification;
}
