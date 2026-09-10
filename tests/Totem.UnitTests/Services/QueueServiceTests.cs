using Moq;
using Totem.Application.Services.QueueServices;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Common.Domain.Notification;
using Totem.Domain.Models.QueueModels;


namespace Totem.UnitTests.Services
{
	public class QueueServiceTests
	{
		private readonly Mock<IQueueRepository> _queueRepositoryMock;
		private readonly Mock<INotificator> _notificationMock;
		private readonly Mock<IQueueQueries> _queueQueriesMock;
		private readonly Mock<IUserQueuePermissionRepository> _userQueuePermissionRepositoryMock;
		private readonly QueueService _sut;

		public QueueServiceTests()
		{
			_notificationMock = new Mock<INotificator>();
			_queueRepositoryMock = new Mock<IQueueRepository>();
			_queueQueriesMock = new Mock<IQueueQueries>();
			_userQueuePermissionRepositoryMock = new Mock<IUserQueuePermissionRepository>();

			_sut = new QueueService(_notificationMock.Object, _queueRepositoryMock.Object, _queueQueriesMock.Object, _userQueuePermissionRepositoryMock.Object);
		}

		[Fact(DisplayName = "AddAsync - Quando cadastrar fila com nome repetido deve retornar erro")]
		public async Task AddAsync_QuandoCadastrarFilaComNomeRepetido_DeveRetornarErro()
		{
			//Arrange 
			_queueRepositoryMock.Setup(u => u.ExistsAsync(It.IsAny<string>())).ReturnsAsync(true);

			//Act
			var result = await _sut.AddAsync(new QueueRequest
			{
				Name = "Fila Teste",
				IsActive = true,
			});

			//Assert
			Assert.False(result.result.Success);
			_queueRepositoryMock.Verify(x => x.Add(It.IsAny<Queue>()), Times.Never);
		}
	}
}
