using Moq;
using Totem.Application.Services.IdentityServices;
using Totem.Common.Data;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Models.IdentityModels;

namespace Totem.UnitTests.Services
{
	public class UserQueuePermissionServiceTests
	{
		private readonly Mock<INotificator> _notificationMock;
		private readonly Mock<IUserQueuePermissionRepository> _userQueuePermissionRepositoryMock;
		private readonly Mock<IQueueRepository> _queueRepositoryMock;
		private readonly Mock<IUnitOfWork> _unitOfWorkMock;
		private UserQueuePermissionService _sut;

		public UserQueuePermissionServiceTests() 
		{
			_notificationMock = new Mock<INotificator>();
			_userQueuePermissionRepositoryMock = new Mock<IUserQueuePermissionRepository>();
			_queueRepositoryMock = new Mock<IQueueRepository>();
			_unitOfWorkMock = new Mock<IUnitOfWork>();

			_userQueuePermissionRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(_unitOfWorkMock.Object);

			_sut = new UserQueuePermissionService(
				_notificationMock.Object,
				_userQueuePermissionRepositoryMock.Object,
				_queueRepositoryMock.Object);
		}

		[Fact(DisplayName = "SetPermissionsAsync - Fila inexistente retorna erro e não grava nada")]
		public async Task SetPermission_QueueDoesNotExist_ReturnsError()
		{
			// Arrange
			var userId = Guid.NewGuid();
			_queueRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Queue?)null);

			// Act
			var result = await _sut.SetPermissionsAsync(userId, new SetUserQueuePermissionsRequest { QueueIds = new List<Guid> { Guid.NewGuid() } });

			// Assert
			Assert.False(result.Success);
			Assert.Contains(result.GetNotifications(), n => n.Message == Errors.QueueNotFound);

			// Assert - o que Não pode ter acontecido
			_userQueuePermissionRepositoryMock.Verify(x => 
										x.SetPermissionsAsync(It.IsAny<Guid>(), It.IsAny<List<Guid>>()), Times.Never);
		}
	}
}
