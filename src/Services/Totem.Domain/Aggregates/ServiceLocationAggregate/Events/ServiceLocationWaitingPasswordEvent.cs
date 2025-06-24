using MediatR;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate.Events
{
    /// <summary>
    /// Represents an event that occurs when a service location is waiting for a password to proceed.
    /// </summary>
    /// <param name="ServiceLocationId">The unique identifier of the service location associated with the event.</param>
    /// <param name="QueueId">The unique identifier of the queue associated with the event.</param>
    public record ServiceLocationWaitingPasswordEvent(Guid ServiceLocationId, Guid QueueId) : INotification;
}
