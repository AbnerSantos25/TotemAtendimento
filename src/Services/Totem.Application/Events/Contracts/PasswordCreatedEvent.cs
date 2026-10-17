using MediatR;

namespace Totem.Application.Events.Contracts
{
    public record PasswordCreatedEvent(
		Guid PasswordId,
		Guid QueueId,
		int Code,
		DateTime CreatedAt,
		bool Preferential) : INotification;

}
