using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    public record PasswordCreatedEvent(
		Guid PasswordId,
		Guid QueueId,
		int Code,
		DateTime CreatedAt,
		bool Preferential) : INotification;

}
