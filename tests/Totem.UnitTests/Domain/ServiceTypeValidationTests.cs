using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.ServiceTypeAggregate;

namespace Totem.UnitTests.Domain;

public class ServiceTypeValidationTests
{
    private static readonly Guid QueueId = Guid.NewGuid();

    private static string[] Messages(string title = "Exames", string? icon = "flask", string? color = "#3b82f6", string? prefix = "EX", Guid? queueId = null) =>
        ServiceTypeConstructorValidation.AllowedAdd(title, icon, color, prefix, queueId ?? QueueId)
            .Notifications.Select(n => n.Message).ToArray();

    [Fact(DisplayName = "Dados válidos passam, com ou sem cor")]
    public void AllowedAdd_WhenValid_ShouldPass()
    {
        Assert.Empty(Messages());
        Assert.Empty(Messages(color: null));
    }

    [Theory(DisplayName = "Cor fora do formato #RGB/#RRGGBB é recusada")]
    [InlineData("#GGG")]
    [InlineData("3b82f6")]
    [InlineData("#3b82f")]
    [InlineData("")]
    public void AllowedAdd_WhenColorInvalid_ShouldFail(string color)
    {
        Assert.Equal(new[] { Errors.InvalidColor }, Messages(color: color));
    }

    [Fact(DisplayName = "Fila de destino vazia (Guid.Empty) é recusada")]
    public void AllowedAdd_WhenTargetQueueEmpty_ShouldFail()
    {
        Assert.Equal(new[] { string.Format(Errors.RequiredField, Labels.TargetQueueId) }, Messages(queueId: Guid.Empty));
    }

    [Fact(DisplayName = "Título vazio ou acima do limite é recusado com a mensagem do campo")]
    public void AllowedAdd_WhenTitleInvalid_ShouldFail()
    {
        Assert.Equal(new[] { string.Format(Errors.RequiredField, Labels.Title) }, Messages(title: ""));
        Assert.Equal(
            new[] { string.Format(Errors.MaxLengthField, Labels.Title, ServiceType.TitleMaxLength) },
            Messages(title: new string('a', ServiceType.TitleMaxLength + 1)));
    }

    [Fact(DisplayName = "Construtor com dados inválidos lança DomainException")]
    public void Constructor_WhenInvalid_ShouldThrow()
    {
        var ex = Assert.Throws<DomainException>(() => new ServiceType("", null, "#GGG", null, QueueId));
        Assert.Equal(Errors.UnableCreateServiceType, ex.Message);
    }

    [Fact(DisplayName = "Update com dados inválidos lança DomainException e não altera a entidade")]
    public void Update_WhenInvalid_ShouldThrow()
    {
        var serviceType = new ServiceType("Exames", null, null, null, QueueId);

        var ex = Assert.Throws<DomainException>(() => serviceType.Update("Exames", null, "#GGG", QueueId, null));
        Assert.Equal(Errors.UnableUpdateServiceType, ex.Message);
        Assert.Null(serviceType.Color);
    }
}
