using Totem.Application.Models;
using Totem.Domain.Models.RefreshTokenModels;
using Totem.SharedKernel.Models;

namespace Totem.Application.Services.RefreshTokenServices
{
	public interface IRefreshTokenService
	{
		Task<(Result result, Guid data)> SaveRefreshTokenAsync(Guid user);
		Task<(Result result, IRefreshTokenView data)> GetByTokenAsync(Guid token);
		Task<(Result result, AuthResult data)> RefreshTokenAsync(Guid userId, Guid tokenId);
	}
}
