using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
	public record PasswordQueueChangedEvent(Guid PasswordId, Guid OldQueueId, Guid NewQueueId) : INotification;

}
