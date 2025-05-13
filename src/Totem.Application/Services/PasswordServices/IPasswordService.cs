using Totem.Common.Services;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
	public interface IPasswordService
	{
		Task<(Result result, PasswordView data)> GetByIdPasswordAsync(Guid id);
		Task<(Result result, List<PasswordView> data)> GetListPasswordAsync();
		Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request);
		Task<Result> RemovePasswordAsync(Guid id);
		Task<(Result result, PasswordView data)> AssignNextPasswordAsync(Guid queueId, Guid serviceLocationId, string newServiceLocationName);
		Task<Result> TransferPasswordAsync(Guid passwordId, PasswordTransferRequest passwordTransfer);
		Task<Result> MarkAsServed(Guid passwordId);

	}
}
