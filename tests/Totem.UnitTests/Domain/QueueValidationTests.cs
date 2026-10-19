using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.UnitTests.Domain;

public class QueueValidationTests
{
    private static string[] Messages(string name) =>
        QueueConstructorValidation.AllowedAdd(name).Notifications.Select(n => n.Message).ToArray();

    [Fact(DisplayName = "Nome válido passa")]
    public void AllowedAdd_WhenValid_ShouldPass()
    {
        Assert.Empty(Messages("Atendimento Geral"));
    }

    [Fact(DisplayName = "Nome vazio ou acima do limite é recusado com a mensagem do campo")]
    public void AllowedAdd_WhenNameInvalid_ShouldFail()
    {
        Assert.Equal(new[] { string.Format(Errors.RequiredField, Labels.QueueName) }, Messages(" "));
        Assert.Equal(
            new[] { string.Format(Errors.MaxLengthField, Labels.QueueName, Queue.NameMaxLength) },
            Messages(new string('a', Queue.NameMaxLength + 1)));
    }

    [Fact(DisplayName = "Construtor com nome inválido lança DomainException")]
    public void Constructor_WhenInvalid_ShouldThrow()
    {
        var ex = Assert.Throws<DomainException>(() => new Queue(""));
        Assert.Equal(Errors.UnableCreateQueue, ex.Message);
    }

    [Fact(DisplayName = "Update com nome inválido lança DomainException e mantém o nome")]
    public void Update_WhenInvalid_ShouldThrowAndKeepName()
    {
        var queue = new Queue("Geral");

        var ex = Assert.Throws<DomainException>(() => queue.Update(""));
        Assert.Equal(Errors.UnableUpdateQueue, ex.Message);
        Assert.Equal("Geral", queue.Name);
    }
}
