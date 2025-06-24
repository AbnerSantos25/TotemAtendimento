namespace Totem.SharedKernel.Services
{
	public interface IIdentityIntegrationService 
	{
		Task<bool> ExistsUser(string userId);
		Task<(Result Result, string Data)> GenerateJwtTokenAsync(string userId);


	}
}
