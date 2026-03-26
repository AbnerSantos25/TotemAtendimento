using Microsoft.AspNetCore.Identity;
using Totem.Common.Enumerations;
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
		Task<Result> UpdatePasswordAsync(Guid id, UpdatePasswordRequest request);
		Task<Result> UpdateEmailAsync(Guid id, UpdateEmailRequest request);
		
		Task<Result> AddUserToRoleAsync(AssignRoleRequest request);
		Task<Result> AddUserToRolesAsync(AssignRolesRequest request);

		Task<Result> RemoveUserFromRoleAsync(Guid userId, Role role);
		Task<(Result Result, LoginDataView Data)> LoginUserAsync(LoginUserView loginUserView);
		Task<Result> InactiveUser(Guid id);
		Task<Result> ActiveUser(Guid id);
	}
}