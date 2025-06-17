using Microsoft.AspNetCore.Identity;
using Totem.Domain.Models.RefreshTokenModels;
using Totem.SharedKernel.Models;

namespace Totem.Application.Services.RefreshTokenServices
{
	public interface IRefreshTokenService
	{
		Task<(Result result, Guid data)> SaveRefreshTokenAsync(string user);
		Task<(Result result, IRefreshTokenView data)> GetByTokenAsync(Guid token);
		Task <(Result result, JwtAndTokenView data)> RefreshTokenAsync(string userId, Guid tokenId);
	}
}
