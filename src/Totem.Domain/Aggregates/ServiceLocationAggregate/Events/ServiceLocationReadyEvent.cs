using MediatR;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate.Events
{
    public record ServiceLocationReadyEvent(Guid ServiceLocationId, Guid QueueId) : INotification;
}
