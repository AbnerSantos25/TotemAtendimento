using MediatR;
using Microsoft.Extensions.Options;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.RefreshTokenAggregate.Events;

namespace Totem.Application.Events
{
	public class SaveRefreshTokenEventHandler : INotificationHandler<SaveRefreshTokenEvent>
	{
		private readonly IRefreshTokenRepository _refreshTokenRepository;
		private readonly JwtSettings _jwtSettings;

		public SaveRefreshTokenEventHandler(IRefreshTokenRepository refreshTokenRepository, IOptions<JwtSettings> jwtSettings)
		{
			_refreshTokenRepository = refreshTokenRepository;
			_jwtSettings = jwtSettings.Value;
		}
		public async Task Handle(SaveRefreshTokenEvent notification, CancellationToken cancellationToken)
		{
			var refreshToken = new RefreshToken(notification.token, notification.userId, DateTime.UtcNow.AddHours(_jwtSettings.RefreshTokenExpirationHours), false);
			_refreshTokenRepository.Add(refreshToken);

			if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				Console.WriteLine(Errors.ErrorSavingDatabase);
		}
	}
}
