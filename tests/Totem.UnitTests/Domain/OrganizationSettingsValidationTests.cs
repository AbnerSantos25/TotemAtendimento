using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Common.ValueObject;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;

namespace Totem.UnitTests.Domain;

public class OrganizationSettingsValidationTests
{
    private const string ValidCnpj = "11222333000181";
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    private static string[] Save(string name = "Organização", string? cnpj = ValidCnpj, string website = "www.exemplo.com.br") =>
        OrganizationSettingsConstructorValidation.AllowedSave(name, cnpj, website).Notifications.Select(n => n.Message).ToArray();

    private static string[] Logo(byte[] logo, string? contentType) =>
        OrganizationSettingsConstructorValidation.AllowedSetLogo(logo, contentType).Notifications.Select(n => n.Message).ToArray();

    [Fact(DisplayName = "Dados válidos passam")]
    public void AllowedSave_WhenValid_ShouldPass()
    {
        Assert.Empty(Save());
        Assert.Empty(Save(website: "exemplo.com.br/contato"));
    }

    [Theory(DisplayName = "Nome fora de 3 a 100 caracteres é recusado")]
    [InlineData("")]
    [InlineData("ab")]
    public void AllowedSave_WhenNameInvalid_ShouldFail(string name)
    {
        Assert.Equal(new[] { Errors.OrganizationNameMinLength }, Save(name: name));
        Assert.Equal(new[] { Errors.OrganizationNameMinLength }, Save(name: new string('a', OrganizationSettings.NameMaxLength + 1)));
    }

    [Theory(DisplayName = "Site fora do formato de domínio é recusado")]
    [InlineData("")]
    [InlineData("exemplo")]
    [InlineData("https://www.exemplo.com.br")]
    public void AllowedSave_WhenWebsiteInvalid_ShouldFail(string website)
    {
        Assert.Equal(new[] { Errors.InvalidWebsite }, Save(website: website));
    }

    [Fact(DisplayName = "Site acima do limite é recusado com a mensagem do campo")]
    public void AllowedSave_WhenWebsiteTooLong_ShouldFail()
    {
        var website = "a.com.br/" + new string('a', OrganizationSettings.WebsiteMaxLength);

        Assert.Equal(
            new[] { string.Format(Errors.MaxLengthField, Labels.Website, OrganizationSettings.WebsiteMaxLength) },
            Save(website: website));
    }

    [Fact(DisplayName = "Todos os erros voltam juntos")]
    public void AllowedSave_WhenSeveralInvalid_ShouldReturnAllMessages()
    {
        Assert.Equal(
            new[] { Errors.OrganizationNameMinLength, Errors.InvalidCnpj, Errors.InvalidWebsite },
            Save(name: "ab", cnpj: "11222333000180", website: "exemplo"));
    }

    [Fact(DisplayName = "Logo válida passa; tipo desconhecido é recusado")]
    public void AllowedSetLogo_ContentType()
    {
        Assert.Empty(Logo(Png, "image/png"));
        Assert.Equal(new[] { Errors.InvalidLogoFormat }, Logo(Png, null));
        Assert.Equal(new[] { Errors.InvalidLogoFormat }, Logo(Png, "image/gif"));
    }

    [Fact(DisplayName = "Logo grande devolve só LogoTooLarge, sem checar o tipo (StopOnFailure)")]
    public void AllowedSetLogo_WhenTooLarge_ShouldStopOnFailure()
    {
        Assert.Equal(new[] { Errors.LogoTooLarge }, Logo(new byte[OrganizationSettings.LogoMaxBytes + 1], null));
    }

    [Fact(DisplayName = "Update e SetLogo inválidos lançam DomainException e mantêm os dados")]
    public void Guards_WhenInvalid_ShouldThrowAndKeepData()
    {
        var settings = new OrganizationSettings("Organização", new Cnpj(ValidCnpj), "exemplo.com.br");

        var update = Assert.Throws<DomainException>(() => settings.Update("ab", new Cnpj(ValidCnpj), "exemplo.com.br"));
        Assert.Equal(Errors.FailedToSaveOrganizationSettings, update.Message);
        Assert.Equal("Organização", settings.Name);

        var other = new OrganizationSettings("Organização", new Cnpj(ValidCnpj), "exemplo.com.br");
        Assert.Throws<DomainException>(() => other.SetLogo(Png, "image/gif"));
        Assert.Null(other.Logo);
    }
}
