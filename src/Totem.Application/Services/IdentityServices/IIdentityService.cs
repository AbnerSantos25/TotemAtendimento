using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
    public interface IIdentityService 
    {
        Task<(Result Result, string Data)> GenerateJwtTokenAsync();
        Task<(Result Result, string Data)> RegisterUserAsync(RegisterUserView registerUserView);
        Task<(Result Result, string Data)> LoginUserAsync(LoginUserView loginUserView);
        Task<Result> InactiveUser(Guid id);
		Task<Result> ActiveUser(Guid id);
	}
}
