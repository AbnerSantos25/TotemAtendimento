using Moq;
using System.Security.Claims;
using Totem.Application.Services.PasswordMatchingServices;
using Totem.Common.Enumerations;
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
		private readonly Mock<IWaitingServiceLocationStore> _waitingLocationsMock;
		private readonly QueueService _sut;

		public QueueServiceTests()
		{
			_notificationMock = new Mock<INotificator>();
			_queueRepositoryMock = new Mock<IQueueRepository>();
			_queueQueriesMock = new Mock<IQueueQueries>();
			_userQueuePermissionRepositoryMock = new Mock<IUserQueuePermissionRepository>();
			_waitingLocationsMock = new Mock<IWaitingServiceLocationStore>();

			_sut = new QueueService(_notificationMock.Object, _queueRepositoryMock.Object, _queueQueriesMock.Object, _userQueuePermissionRepositoryMock.Object, _waitingLocationsMock.Object);
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

		private static ClaimsPrincipal Caller(Role role, Guid? userId = null)
		{
			var claims = new List<Claim> { new(ClaimTypes.Role, role.ToString()) };
			if (userId is not null)
				claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()));
			return new ClaimsPrincipal(new ClaimsIdentity(claims, "test"));
		}

		[Fact(DisplayName = "GetListByPermissionAsync - Manager vê todas as filas sem consultar permissões")]
		public async Task GetListByPermissionAsync_Manager_SeesAllQueues()
		{
			var all = new List<QueueSummary> { new() { Id = Guid.NewGuid(), Name = "Geral" } };
			_queueQueriesMock.Setup(q => q.GetListAsync()).ReturnsAsync(all);

			var result = await _sut.GetListByPermissionAsync(Caller(Role.Manager, Guid.NewGuid()));

			Assert.Same(all, result.data);
			_userQueuePermissionRepositoryMock.Verify(p => p.GetAllowedQueueIdsAsync(It.IsAny<Guid>()), Times.Never);
		}

		[Fact(DisplayName = "GetListByPermissionAsync - User vê só as filas liberadas para ele")]
		public async Task GetListByPermissionAsync_User_SeesOnlyAllowedQueues()
		{
			var userId = Guid.NewGuid();
			var allowed = new List<Guid> { Guid.NewGuid() };
			var queues = new List<QueueSummary> { new() { Id = allowed[0], Name = "Exames" } };
			_userQueuePermissionRepositoryMock.Setup(p => p.GetAllowedQueueIdsAsync(userId)).ReturnsAsync(allowed);
			_queueQueriesMock.Setup(q => q.GetListByIdsAsync(allowed)).ReturnsAsync(queues);

			var result = await _sut.GetListByPermissionAsync(Caller(Role.User, userId));

			Assert.Same(queues, result.data);
			_queueQueriesMock.Verify(q => q.GetListAsync(), Times.Never);
		}

		[Fact(DisplayName = "GetListByPermissionAsync - User sem id no token recebe lista vazia")]
		public async Task GetListByPermissionAsync_UserWithoutId_GetsEmptyList()
		{
			var result = await _sut.GetListByPermissionAsync(Caller(Role.User));

			Assert.True(result.result.Success);
			Assert.Empty(result.data);
			_userQueuePermissionRepositoryMock.Verify(p => p.GetAllowedQueueIdsAsync(It.IsAny<Guid>()), Times.Never);
		}

		[Fact(DisplayName = "CanAccessQueueAsync - System acessa qualquer fila; User depende da permissão; sem id, nega")]
		public async Task CanAccessQueueAsync_FollowsTheSameRule()
		{
			var userId = Guid.NewGuid();
			var allowedQueue = Guid.NewGuid();
			_userQueuePermissionRepositoryMock.Setup(p => p.HasPermissionAsync(userId, allowedQueue)).ReturnsAsync(true);

			Assert.True(await _sut.CanAccessQueueAsync(Caller(Role.System), Guid.NewGuid()));
			Assert.True(await _sut.CanAccessQueueAsync(Caller(Role.User, userId), allowedQueue));
			Assert.False(await _sut.CanAccessQueueAsync(Caller(Role.User, userId), Guid.NewGuid()));
			Assert.False(await _sut.CanAccessQueueAsync(Caller(Role.User), allowedQueue));
		}
	}
}
