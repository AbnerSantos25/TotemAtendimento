using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Models.RefreshTokenModels;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.RefreshTokenServices
{
	public class RefreshTokenService : BaseService, IRefreshTokenService
	{
		private readonly IRefreshTokenRepository _refreshTokenRepository;
		private readonly IIdentityIntegrationService _identityIntegrationService;

		public RefreshTokenService(INotificador notificador, IRefreshTokenRepository refreshTokenRepository, IIdentityIntegrationService identityIntegrationService) : base(notificador)
		{
			_refreshTokenRepository = refreshTokenRepository;
			_identityIntegrationService = identityIntegrationService;
		}

		public async Task<(Result result, IRefreshTokenView data)> GetByTokenAsync(Guid token)
		{
			RefreshToken? refreshToken = await _refreshTokenRepository.GetByTokenIdAsync(token);
			if (refreshToken == null) 
				return Unsuccessful<IRefreshTokenView>(Errors.RefreshTokenNotFound);
			
			return Successful<RefreshTokenView>(refreshToken);
		}

		public async Task<(Result result, JwtAndTokenView data)> RefreshTokenAsync(string userId, Guid oldToken)
		{
			var token = await _refreshTokenRepository.GetByTokenIdAsync(oldToken);
			if (token == null || token.Revoked || token.ExpiryDate < DateTime.UtcNow)
				return Unsuccessful<JwtAndTokenView>(Errors.InvalidRefreshToken);

			if (!await _identityIntegrationService.ExistsUser(userId))
				return Unsuccessful<JwtAndTokenView>(Errors.UserNotFound);

			// (Opcional) Gera novo refresh token
			var newRefreshToken = await SaveRefreshTokenAsync(userId);
			if (!newRefreshToken.result.Success)
				return Unsuccessful<JwtAndTokenView>(newRefreshToken.result.ObterNotificacoes());

			// Gera novo JWT
			var jwt = await _identityIntegrationService.GenerateJwtTokenAsync(userId);

			token.Revoke(newRefreshToken.data);
			_refreshTokenRepository.Update(token);

			if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				return Unsuccessful<JwtAndTokenView>(Errors.ErrorSavingDatabase);

			var result = new JwtAndTokenView { JWT = jwt.Data, NewToken = newRefreshToken.data};

			return Successful(result);
		}

		public async Task<(Result result, Guid data)> SaveRefreshTokenAsync(string userId)
		{
			var token = Guid.NewGuid();
			var refreshToken = new RefreshToken(token, userId, DateTime.UtcNow.AddMinutes(10), false);

			_refreshTokenRepository.Add(refreshToken);

			if(!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful(token);
		}
	}
}
