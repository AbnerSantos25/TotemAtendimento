using MediatR;

namespace Totem.Application.Events.Contracts
{
	public record SaveRefreshTokenEvent(Guid token, Guid userId) : INotification; 
}
