using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
	public record PasswordMarkedAsServedEvent(Guid PasswordId) : INotification;

}
