using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity;
using Totem.Application.Models;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Models.RefreshTokenModels;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.RefreshTokenServices
{
	public class RefreshTokenService : BaseService, IRefreshTokenService
	{
		private readonly IRefreshTokenRepository _refreshTokenRepository;
		private readonly IIdentityIntegrationService _identityIntegrationService;
        private readonly UserManager<User> _userManager;

        private static readonly TimeSpan RefreshGracePeriod = TimeSpan.FromHours(2);

        public RefreshTokenService(INotificator notificador, IRefreshTokenRepository refreshTokenRepository, IIdentityIntegrationService identityIntegrationService, UserManager<User> userManager) : base(notificador)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _identityIntegrationService = identityIntegrationService;
            _userManager = userManager;
        }

        public async Task<(Result result, IRefreshTokenView data)> GetByTokenAsync(Guid token)
		{
			RefreshToken? refreshToken = await _refreshTokenRepository.GetByTokenIdAsync(token);
			if (refreshToken == null) 
				return Unsuccessful<IRefreshTokenView>(Errors.RefreshTokenNotFound);
			
			return Successful<RefreshTokenView>(refreshToken);
		}

		public async Task<(Result result, AuthResult data)> RefreshTokenAsync(Guid userId, Guid oldToken)
		{
			var token = await _refreshTokenRepository.GetByTokenIdAsync(oldToken);
			if (token == null || token.Revoked)
				return Unsuccessful<AuthResult>(Errors.InvalidRefreshToken);

			if (token.ExpiryDate < DateTime.UtcNow)
			{
				var timeSinceExpiry = DateTime.UtcNow - token.ExpiryDate;
				if (timeSinceExpiry > RefreshGracePeriod)
					return Unsuccessful<AuthResult>(Errors.RefreshTokenExpired);
			}

			if (!await _identityIntegrationService.ExistsUser(userId))
				return Unsuccessful<AuthResult>(Errors.UserNotFound);

			var newRefreshToken = await SaveRefreshTokenAsync(userId);
			if (!newRefreshToken.result.Success)
				return Unsuccessful<AuthResult>(newRefreshToken.result.GetNotifications());

			var jwt = await _identityIntegrationService.GenerateJwtTokenAsync(userId);

			token.Revoke(newRefreshToken.data);
			_refreshTokenRepository.Update(token);

			if (!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				return Unsuccessful<AuthResult>(Errors.ErrorSavingDatabase);

			var user = await _userManager.FindByIdAsync(userId.ToString());
			var roles = await _userManager.GetRolesAsync(user!);
            var userView = new UserView { Id = user!.Id, Email = user.Email, Name = user.FullName, IsActive = user.IsActive, Roles = roles.ToList() };

            return Successful(new AuthResult { Jwt = jwt.Data, RefreshToken = newRefreshToken.data, UserView = userView });
		}

		public async Task<(Result result, Guid data)> SaveRefreshTokenAsync(Guid userId)
		{
			var token = Guid.NewGuid();
			var refreshToken = new RefreshToken(token, userId, DateTime.UtcNow.AddHours(1), false);

			_refreshTokenRepository.Add(refreshToken);

			if(!await _refreshTokenRepository.UnitOfWork.CommitAsync())
				Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful(token);
		}
	}
}
