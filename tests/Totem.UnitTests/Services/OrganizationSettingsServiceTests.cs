using Moq;
using Totem.Application.Services.OrganizationSettingsServices;
using Totem.Common.Data;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.ValueObject;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;
using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.UnitTests.Services;

public class OrganizationSettingsServiceTests
{
    private static readonly byte[] Png = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00 };

    private readonly Mock<IOrganizationSettingsRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly OrganizationSettingsService _sut;

    public OrganizationSettingsServiceTests()
    {
        _unitOfWorkMock.Setup(u => u.CommitAsync()).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.UnitOfWork).Returns(_unitOfWorkMock.Object);
        _sut = new OrganizationSettingsService(new Notificator(), _repositoryMock.Object, Mock.Of<IOrganizationSettingsQueries>());
    }

    private static OrganizationSettingsRequest ValidRequest(bool removeLogo = false) => new()
    {
        Name = "Organização Teste",
        Cnpj = "12.ABC.345/01DE-35",
        WebsiteUrl = "https://www.exemplo.com.br/",
        RemoveLogo = removeLogo
    };

    private static OrganizationSettings ExistingWithLogo()
    {
        var settings = new OrganizationSettings("Antiga", new Cnpj("11222333000181"), "antiga.com.br");
        settings.SetLogo(Png, "image/png");
        return settings;
    }

    [Fact(DisplayName = "UpdateAsync: primeiro save cria o registro, normalizando CNPJ e site")]
    public async Task UpdateAsync_WhenNotConfigured_ShouldAdd()
    {
        _repositoryMock.Setup(r => r.GetAsync()).ReturnsAsync((OrganizationSettings?)null);

        var (result, data) = await _sut.UpdateAsync(ValidRequest(), logo: null);

        Assert.True(result.Success);
        Assert.Equal("12ABC34501DE35", data.Cnpj);
        Assert.Equal("www.exemplo.com.br", data.WebsiteUrl);
        Assert.Null(data.LogoUrl);
        _repositoryMock.Verify(r => r.Add(It.IsAny<OrganizationSettings>()), Times.Once);
        _repositoryMock.Verify(r => r.Update(It.IsAny<OrganizationSettings>()), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync: registro existente é atualizado, não duplicado")]
    public async Task UpdateAsync_WhenConfigured_ShouldUpdate()
    {
        _repositoryMock.Setup(r => r.GetAsync()).ReturnsAsync(ExistingWithLogo());

        var (result, data) = await _sut.UpdateAsync(ValidRequest(), logo: null);

        Assert.True(result.Success);
        Assert.Equal("Organização Teste", data.Name);
        _repositoryMock.Verify(r => r.Update(It.IsAny<OrganizationSettings>()), Times.Once);
        _repositoryMock.Verify(r => r.Add(It.IsAny<OrganizationSettings>()), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync: CNPJ inválido não chega ao banco")]
    public async Task UpdateAsync_WhenCnpjInvalid_ShouldNotCommit()
    {
        var request = ValidRequest();
        request.Cnpj = "12ABC34501DE36";

        var (result, _) = await _sut.UpdateAsync(request, logo: null);

        Assert.False(result.Success);
        Assert.Contains(result.GetNotifications(), n => n.Message == Errors.InvalidCnpj);
        _unitOfWorkMock.Verify(u => u.CommitAsync(), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync: logo acima de 1 MB é recusada")]
    public async Task UpdateAsync_WhenLogoTooLarge_ShouldFail()
    {
        var logo = new byte[OrganizationSettings.LogoMaxBytes + 1];
        Png.CopyTo(logo, 0);

        var (result, _) = await _sut.UpdateAsync(ValidRequest(), logo);

        Assert.False(result.Success);
        Assert.Contains(result.GetNotifications(), n => n.Message == Errors.LogoTooLarge);
        _unitOfWorkMock.Verify(u => u.CommitAsync(), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync: arquivo sem assinatura de imagem é recusado")]
    public async Task UpdateAsync_WhenLogoIsNotAnImage_ShouldFail()
    {
        var (result, _) = await _sut.UpdateAsync(ValidRequest(), "MZ executavel"u8.ToArray());

        Assert.False(result.Success);
        Assert.Contains(result.GetNotifications(), n => n.Message == Errors.InvalidLogoFormat);
    }

    [Fact(DisplayName = "UpdateAsync: o tipo da logo vem da assinatura do arquivo")]
    public async Task UpdateAsync_WhenLogoSent_ShouldStoreDetectedContentType()
    {
        OrganizationSettings? saved = null;
        _repositoryMock.Setup(r => r.GetAsync()).ReturnsAsync((OrganizationSettings?)null);
        _repositoryMock.Setup(r => r.Add(It.IsAny<OrganizationSettings>())).Callback<OrganizationSettings>(s => saved = s);

        var (result, data) = await _sut.UpdateAsync(ValidRequest(), Png);

        Assert.True(result.Success);
        Assert.Equal("image/png", saved!.LogoContentType);
        Assert.StartsWith(OrganizationSettingsView.LogoPath + "?v=", data.LogoUrl);
    }

    [Fact(DisplayName = "UpdateAsync: RemoveLogo apaga a logo atual")]
    public async Task UpdateAsync_WhenRemoveLogo_ShouldClearLogo()
    {
        var existing = ExistingWithLogo();
        _repositoryMock.Setup(r => r.GetAsync()).ReturnsAsync(existing);

        var (result, data) = await _sut.UpdateAsync(ValidRequest(removeLogo: true), logo: null);

        Assert.True(result.Success);
        Assert.Null(existing.Logo);
        Assert.Null(existing.LogoContentType);
        Assert.Null(data.LogoUrl);
    }

    [Fact(DisplayName = "UpdateAsync: sem arquivo e sem RemoveLogo, a logo atual é mantida")]
    public async Task UpdateAsync_WhenNoLogoChange_ShouldKeepLogo()
    {
        var existing = ExistingWithLogo();
        _repositoryMock.Setup(r => r.GetAsync()).ReturnsAsync(existing);

        var (result, data) = await _sut.UpdateAsync(ValidRequest(), logo: null);

        Assert.True(result.Success);
        Assert.Equal(Png, existing.Logo);
        Assert.NotNull(data.LogoUrl);
    }
}
