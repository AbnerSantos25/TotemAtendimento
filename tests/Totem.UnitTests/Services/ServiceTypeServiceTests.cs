using Moq;
using Totem.Application.Services.ServiceTypeServices;
using Totem.Common.Domain.Notification;
using Totem.Domain.Aggregates.ServiceTypeAggregate;
using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.UnitTests.Services;

// Testa a regra de negócio do ServiceTypeService de forma isolada,
// sem precisar de banco de dados ou IO real.
public class ServiceTypeServiceTests
{
    private readonly Mock<INotificator> _notificatorMock;
    private readonly Mock<IServiceTypeQueries> _queriesMock;
    private readonly Mock<IServiceTypeRepository> _repositoryMock;
    private readonly ServiceTypeService _sut; // System Under Test

    public ServiceTypeServiceTests()
    {
        _notificatorMock = new Mock<INotificator>();
        _queriesMock = new Mock<IServiceTypeQueries>();
        _repositoryMock = new Mock<IServiceTypeRepository>();
        _sut = new ServiceTypeService(_notificatorMock.Object, _queriesMock.Object, _repositoryMock.Object);
    }

    [Fact(DisplayName = "DeleteAsync: deve falhar quando o serviço não existe")]
    public async Task DeleteAsync_WhenServiceTypeNotFound_ShouldReturnUnsuccessful()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((ServiceType?)null);

        // Act
        var result = await _sut.DeleteAsync(Guid.NewGuid());

        // Assert
        Assert.False(result.Success);
        _repositoryMock.Verify(r => r.Delete(It.IsAny<ServiceType>()), Times.Never);
    }

    [Fact(DisplayName = "GetByIdAsync: deve falhar quando serviço não existe")]
    public async Task GetByIdAsync_WhenNotFound_ShouldReturnUnsuccessful()
    {
        // Arrange
        _queriesMock.Setup(q => q.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((ServiceTypeView?)null);

        // Act
        var (result, data) = await _sut.GetByIdAsync(Guid.NewGuid());

        // Assert
        Assert.False(result.Success);
        Assert.Null(data);
    }

    [Fact(DisplayName = "GetAllAsync: deve retornar lista vazia sem erros quando banco está vazio")]
    public async Task GetAllAsync_WhenNoServicesExist_ShouldReturnEmptyListWithSuccess()
    {
        // Arrange
        _queriesMock.Setup(q => q.GetListAsync()).ReturnsAsync(new List<ServiceTypeSummary>());

        // Act
        var (result, data) = await _sut.GetAllAsync();

        // Assert
        Assert.True(result.Success);
        Assert.Empty(data);
    }

    [Fact(DisplayName = "ToggleStatusAsync: deve falhar quando serviço não existe")]
    public async Task ToggleStatusAsync_WhenNotFound_ShouldReturnUnsuccessful()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((ServiceType?)null);

        // Act
        var result = await _sut.ToggleStatusAsync(Guid.NewGuid());

        // Assert
        Assert.False(result.Success);
    }
}
