using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
	public interface IIdentityService
	{
		Task<(Result Result, string Data)> GenerateJwtTokenAsync();
		Task<(Result Result, string Data)> RegisterUserAsync(RegisterUserView registerUserView);
		Task<Result> UpdatePasswordAsync(Guid id, UpdatePasswordRequest request);
		Task<Result> UpdateEmailAsync(Guid id, UpdateEmailRequest request);
		Task<(Result Result, string Data)> LoginUserAsync(LoginUserView loginUserView);
		Task<Result> InactiveUser(Guid id);
		Task<Result> ActiveUser(Guid id);
	}
}
