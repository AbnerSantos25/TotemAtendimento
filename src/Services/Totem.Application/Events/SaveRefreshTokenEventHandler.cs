using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Totem.Application.Events.Contracts;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.RefreshTokenAggregate;

namespace Totem.Application.Events
{
	public class SaveRefreshTokenEventHandler : INotificationHandler<SaveRefreshTokenEvent>
	{
		private readonly IRefreshTokenRepository _refreshTokenRepository;
		private readonly JwtSettings _jwtSettings;
		private readonly ILogger<SaveRefreshTokenEventHandler> _logger;

		public SaveRefreshTokenEventHandler(IRefreshTokenRepository refreshTokenRepository, IOptions<JwtSettings> jwtSettings, ILogger<SaveRefreshTokenEventHandler> logger)
		{
			_refreshTokenRepository = refreshTokenRepository;
			_jwtSettings = jwtSettings.Value;
			_logger = logger;
		}
		public async Task Handle(SaveRefreshTokenEvent notification, CancellationToken cancellationToken)
		{
			var refreshToken = new RefreshToken(notification.token, notification.userId, DateTime.UtcNow.AddHours(_jwtSettings.RefreshTokenExpirationHours), false);
			_refreshTokenRepository.Add(refreshToken);

			if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				_logger.LogError("Falha ao salvar o refresh token do usuario {UserId}.", notification.userId);
		}
	}
}
