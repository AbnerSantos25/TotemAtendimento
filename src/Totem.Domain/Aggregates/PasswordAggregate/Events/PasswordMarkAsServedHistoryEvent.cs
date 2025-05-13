using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
	public record PasswordMarkedAsServedHistoryEvent(Guid PasswordId, int Code) : INotification;

}
