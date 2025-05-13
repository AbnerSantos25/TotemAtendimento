using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
	public record PasswordQueueChangedEvent(Guid PasswordId, Guid OldQueueId, Guid NewQueueId, int Code, string OldDescription, string NewDescription) : INotification;

}
