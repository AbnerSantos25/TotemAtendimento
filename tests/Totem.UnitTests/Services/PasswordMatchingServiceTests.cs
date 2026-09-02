using MediatR;
using Moq;
using Totem.Application.Services.PasswordMatchingServices;
using Totem.Common.Data;
using Totem.Common.Domain.Notification;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate.Events;

namespace Totem.UnitTests.Services;

// O pareamento senha/guiche guardava o estado em campo de instancia, mas o handler
// e recriado a cada evento -- o match nunca acontecia. Os testes abaixo exercitam o
// fluxo entre DUAS instancias diferentes do servico, que e exatamente o cenario em
// que a implementacao anterior falhava.
public class PasswordMatchingServiceTests
{
    private readonly IWaitingServiceLocationStore _store = new WaitingServiceLocationStore();
    private readonly Mock<IPasswordRepository> _passwordRepository = new();
    private readonly Mock<IServiceLocationRepository> _serviceLocationRepository = new();
    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public PasswordMatchingServiceTests()
    {
        _unitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(true);
        _passwordRepository.SetupGet(r => r.UnitOfWork).Returns(_unitOfWork.Object);
    }

    // Instancia nova a cada chamada, imitando o handler transiente do MediatR.
    private PasswordMatchingService CreateHandler() => new(
        new Mock<INotificator>().Object,
        _passwordRepository.Object,
        _serviceLocationRepository.Object,
        _store,
        _mediator.Object);

    [Fact(DisplayName = "Guiche em espera recebe a proxima senha criada, mesmo em outra instancia do handler")]
    public async Task PasswordCreated_WhenServiceLocationIsWaiting_ShouldAssignPassword()
    {
        // Arrange
        var queueId = Guid.NewGuid();
        var serviceLocation = new ServiceLocation("Guiche 1", 1);
        var password = new Password(queueId, preferential: false);

        _passwordRepository.Setup(r => r.GetByIdAsync(password.Id)).ReturnsAsync(password);
        _serviceLocationRepository.Setup(r => r.GetByIdAsync(serviceLocation.Id)).ReturnsAsync(serviceLocation);

        // Act - o guiche entra em espera numa instancia...
        await CreateHandler().Handle(
            new ServiceLocationWaitingPasswordEvent(serviceLocation.Id, queueId), CancellationToken.None);

        // ...e a senha chega noutra
        await CreateHandler().Handle(
            new PasswordCreatedEvent(password.Id, queueId, 1, DateTime.UtcNow, false), CancellationToken.None);

        // Assert
        Assert.Equal(serviceLocation.Id, password.ServiceLocationId);
        _passwordRepository.Verify(r => r.Update(password), Times.Once);
        _mediator.Verify(m => m.Publish(It.IsAny<PasswordCalledEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "Senha criada sem guiche em espera nao e atribuida")]
    public async Task PasswordCreated_WhenNoServiceLocationWaiting_ShouldDoNothing()
    {
        var queueId = Guid.NewGuid();
        var password = new Password(queueId, preferential: false);
        _passwordRepository.Setup(r => r.GetByIdAsync(password.Id)).ReturnsAsync(password);

        await CreateHandler().Handle(
            new PasswordCreatedEvent(password.Id, queueId, 1, DateTime.UtcNow, false), CancellationToken.None);

        Assert.Null(password.ServiceLocationId);
        _passwordRepository.Verify(r => r.Update(It.IsAny<Password>()), Times.Never);
        _mediator.Verify(m => m.Publish(It.IsAny<PasswordCalledEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact(DisplayName = "Guiche em espera de outra fila nao recebe a senha")]
    public async Task PasswordCreated_WhenWaitingOnAnotherQueue_ShouldNotAssign()
    {
        var queueId = Guid.NewGuid();
        var otherQueueId = Guid.NewGuid();
        var serviceLocation = new ServiceLocation("Guiche 2", 2);
        var password = new Password(queueId, preferential: false);

        _passwordRepository.Setup(r => r.GetByIdAsync(password.Id)).ReturnsAsync(password);

        await CreateHandler().Handle(
            new ServiceLocationWaitingPasswordEvent(serviceLocation.Id, otherQueueId), CancellationToken.None);
        await CreateHandler().Handle(
            new PasswordCreatedEvent(password.Id, queueId, 1, DateTime.UtcNow, false), CancellationToken.None);

        Assert.Null(password.ServiceLocationId);
        _mediator.Verify(m => m.Publish(It.IsAny<PasswordCalledEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact(DisplayName = "Falha ao gravar devolve o guiche para a espera")]
    public async Task PasswordCreated_WhenCommitFails_ShouldRequeueServiceLocation()
    {
        var queueId = Guid.NewGuid();
        var serviceLocation = new ServiceLocation("Guiche 3", 3);
        var password = new Password(queueId, preferential: false);

        _unitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(false);
        _passwordRepository.Setup(r => r.GetByIdAsync(password.Id)).ReturnsAsync(password);
        _serviceLocationRepository.Setup(r => r.GetByIdAsync(serviceLocation.Id)).ReturnsAsync(serviceLocation);

        await CreateHandler().Handle(
            new ServiceLocationWaitingPasswordEvent(serviceLocation.Id, queueId), CancellationToken.None);
        await CreateHandler().Handle(
            new PasswordCreatedEvent(password.Id, queueId, 1, DateTime.UtcNow, false), CancellationToken.None);

        _mediator.Verify(m => m.Publish(It.IsAny<PasswordCalledEvent>(), It.IsAny<CancellationToken>()), Times.Never);
        Assert.True(_store.TryDequeue(queueId, out var requeued));
        Assert.Equal(serviceLocation.Id, requeued);
    }

    [Fact(DisplayName = "Senha ja atendida nao e reatribuida ao guiche em espera")]
    public async Task PasswordCreated_WhenPasswordAlreadyServed_ShouldNotAssign()
    {
        var queueId = Guid.NewGuid();
        var serviceLocation = new ServiceLocation("Guiche 4", 4);
        var password = new Password(queueId, preferential: false);
        password.AssignToServiceLocation(Guid.NewGuid());
        password.MarkAsServed();

        _passwordRepository.Setup(r => r.GetByIdAsync(password.Id)).ReturnsAsync(password);

        await CreateHandler().Handle(
            new ServiceLocationWaitingPasswordEvent(serviceLocation.Id, queueId), CancellationToken.None);
        await CreateHandler().Handle(
            new PasswordCreatedEvent(password.Id, queueId, 1, DateTime.UtcNow, false), CancellationToken.None);

        _passwordRepository.Verify(r => r.Update(It.IsAny<Password>()), Times.Never);
        _mediator.Verify(m => m.Publish(It.IsAny<PasswordCalledEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
