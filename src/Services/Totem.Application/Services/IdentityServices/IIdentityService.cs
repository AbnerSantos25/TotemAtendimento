using Totem.Domain.Aggregates.UserAggregate;
using Totem.Domain.Models.IdentityModels;
using Totem.SharedKernel.Models;

namespace Totem.Application.Services.IdentityServices
{
	public interface IIdentityService
	{
		Task<(Result Result, string Data)> GenerateJwtTokenAsync(User user);
		Task<(Result Result, List<UserSummary> data)> GetListUserAsync();
		Task<(Result Result, LoginDataView Data)> RegisterUserAsync(RegisterUserView registerUserView);
		Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
		Task<Result> UpdateEmailAsync(Guid userId, UpdateEmailRequest request);
		Task<Result> UpdateUserRolesAsync(AssignRolesRequest request);
		Task<(Result Result, LoginDataView Data)> LoginUserAsync(LoginUserView loginUserView);
		Task<Result> InactiveUser(Guid userId);
		Task<Result> ActiveUser(Guid userId);
        Task<Result> LogoutAsync(Guid userId);
    }
}