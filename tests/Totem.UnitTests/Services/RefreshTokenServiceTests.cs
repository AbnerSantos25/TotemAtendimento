using Microsoft.Extensions.Options;
using Moq;
using Totem.Application.Services.RefreshTokenServices;
using Totem.Common.Domain.Notification;
using Totem.Common.Extension;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.SharedKernel.Services;

namespace Totem.UnitTests.Services
{
	public class RefreshTokenServiceTests
	{
		private readonly Mock<INotificator> _notificationMock;
		private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock;
		private readonly Mock<IIdentityIntegrationService> _identityIntegrationServiceMock;
		private readonly IOptions<JwtSettings> _jwtOptions;

		private readonly RefreshTokenService _sut;

		public RefreshTokenServiceTests()
		{
			_notificationMock = new Mock<INotificator>();
			_refreshTokenRepositoryMock = new Mock<IRefreshTokenRepository>();
			_identityIntegrationServiceMock = new Mock<IIdentityIntegrationService>();
			_jwtOptions = Options.Create(new JwtSettings());

			_sut = new RefreshTokenService(_notificationMock.Object, _refreshTokenRepositoryMock.Object, _identityIntegrationServiceMock.Object, null!, _jwtOptions);
		}

		[Fact(DisplayName = "RefreshTokenAsync - Compara UserId com Id do Token - Quando diferente retorna InvalidRefreshToken")]
		public async Task RefreshTokenAsync_ComparaUserIdComIdDoToken_QuandoDiferenteRetornaInvalidRefreshToken()
		{
			// Arrange
			var userId = Guid.NewGuid();
			var differentUserId = Guid.NewGuid();
			var oldToken = Guid.NewGuid();
			_refreshTokenRepositoryMock.Setup(x => x.GetByTokenIdAsync(It.IsAny<Guid>())).ReturnsAsync(new RefreshToken(oldToken, differentUserId, DateTime.UtcNow.AddHours(1), false));
 
			// Act
			var result = await _sut.RefreshTokenAsync(userId, oldToken);

			// Assert
			Assert.False(result.result.Success);
			Assert.Contains(result.result.GetNotifications(), n => n.Message == Errors.InvalidRefreshToken);
		}

	}
}
