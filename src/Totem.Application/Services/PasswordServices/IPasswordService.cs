using Totem.Common.Services;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
	public interface IPasswordService
	{
        Task<(bool result, PasswordView data)> GetByIdPasswordAsync(Guid id);
		Task<(bool result, List<PasswordView> data)> GetListPasswordAsync();
        Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request);
		Task<bool> RemovePasswordAsync(Guid id);
    }
}
