using MediatR;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.RefreshTokenAggregate.Events;

namespace Totem.Application.Events
{
	public class SaveRefreshTokenEventHandler : INotificationHandler<SaveRefreshTokenEvent>
	{
		private readonly IRefreshTokenRepository _refreshTokenRepository;
		public SaveRefreshTokenEventHandler(IRefreshTokenRepository refreshTokenRepository)
		{
			_refreshTokenRepository = refreshTokenRepository;
		}
		public async Task Handle(SaveRefreshTokenEvent notification, CancellationToken cancellationToken)
		{
			var refreshToken = new RefreshToken(notification.token, notification.userId, DateTime.UtcNow.AddMinutes(10), false);
			_refreshTokenRepository.Add(refreshToken);

			if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				Console.WriteLine(Errors.ErrorSavingDatabase);
		}
	}
}
