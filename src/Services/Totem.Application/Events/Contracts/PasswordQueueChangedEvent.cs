using MediatR;

namespace Totem.Application.Events.Contracts
{
	public record PasswordQueueChangedEvent(Guid PasswordId, Guid OldQueueId, Guid NewQueueId, int Code, string OldDescription, string NewDescription) : INotification;

}
