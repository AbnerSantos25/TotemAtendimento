using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.UnitTests.Domain;

public class ServiceLocationValidationTests
{
    private static readonly string LengthMessage = string.Format(
        Errors.LengthBetweenField, Labels.LocationNameLabel, ServiceLocation.NameMinLength, ServiceLocation.NameMaxLength);

    private static string[] Messages(string name) =>
        ServiceLocationConstructorValidation.AllowedAdd(name, 1).Notifications.Select(n => n.Message).ToArray();

    [Fact(DisplayName = "Nome válido passa, com ou sem número")]
    public void AllowedAdd_WhenValid_ShouldPass()
    {
        Assert.Empty(Messages("Guichê 1"));
        Assert.Empty(ServiceLocationConstructorValidation.AllowedAdd("Sala", null).Notifications);
    }

    [Theory(DisplayName = "Nome vazio, curto ou longo demais é recusado com uma mensagem só")]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData(null)]
    public void AllowedAdd_WhenNameInvalid_ShouldFail(string? name)
    {
        Assert.Equal(new[] { LengthMessage }, Messages(name!));
    }

    [Fact(DisplayName = "Nome acima do limite é recusado")]
    public void AllowedAdd_WhenNameTooLong_ShouldFail()
    {
        Assert.Equal(new[] { LengthMessage }, Messages(new string('a', ServiceLocation.NameMaxLength + 1)));
    }

    [Fact(DisplayName = "Construtor com nome inválido lança DomainException")]
    public void Constructor_WhenInvalid_ShouldThrow()
    {
        var ex = Assert.Throws<DomainException>(() => new ServiceLocation("ab"));
        Assert.Equal(Errors.UnableCreateServiceLocation, ex.Message);
    }

    [Fact(DisplayName = "Update com nome inválido lança DomainException e mantém os dados")]
    public void Update_WhenInvalid_ShouldThrowAndKeepData()
    {
        var serviceLocation = new ServiceLocation("Guichê 1", 1);

        var ex = Assert.Throws<DomainException>(() => serviceLocation.Update("ab", 2));
        Assert.Equal(Errors.UnableUpdateServiceLocation, ex.Message);
        Assert.Equal("Guichê 1", serviceLocation.Name);
        Assert.Equal(1, serviceLocation.Number);
    }
}
