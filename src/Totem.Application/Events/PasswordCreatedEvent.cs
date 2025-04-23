using MediatR;

namespace Totem.Application.Events
{
    public record PasswordCreatedEvent(Guid PasswordId, Guid QueueId) : INotification;
}
