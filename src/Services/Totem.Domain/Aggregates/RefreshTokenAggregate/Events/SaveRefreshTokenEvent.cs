using MediatR;

namespace Totem.Domain.Aggregates.RefreshTokenAggregate.Events
{
	public record SaveRefreshTokenEvent(Guid token, string userId) : INotification; 
}
