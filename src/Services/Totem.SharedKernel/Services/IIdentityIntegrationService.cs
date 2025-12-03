namespace Totem.SharedKernel.Services
{
	public interface IIdentityIntegrationService 
	{
		Task<bool> ExistsUser(Guid userId);
		Task<(Result Result, string Data)> GenerateJwtTokenAsync(Guid userId);


	}
}
