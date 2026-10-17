using Totem.Common.Services;
using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.Application.Services.OrganizationSettingsServices
{
	public interface IOrganizationSettingsService
	{
		/// <summary>Retorna null em data quando a organizacao ainda nao foi configurada.</summary>
		Task<(Result result, OrganizationSettingsView? data)> GetAsync();
		Task<(Result result, OrganizationLogo data)> GetLogoAsync();
		Task<(Result result, OrganizationSettingsView data)> UpdateAsync(OrganizationSettingsRequest request, byte[]? logo);
	}
}
