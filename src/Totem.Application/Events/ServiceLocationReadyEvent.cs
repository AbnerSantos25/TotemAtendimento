using MediatR;

namespace Totem.Application.Events
{
    public record ServiceLocationReadyEvent(Guid ServiceLocationId, Guid QueueId) : INotification;

}
