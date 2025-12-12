using MediatR;

namespace Totem.Domain.Aggregates.RefreshTokenAggregate.Events
{
	public record SaveRefreshTokenEvent(Guid token, Guid userId) : INotification; 
}
