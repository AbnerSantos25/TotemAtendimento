using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Infra.Data.IdentityData;

namespace Totem.Infra.Data.Repositories.RefrashTokenRepository
{
	public class RefreshTokenRepository : IRefreshTokenRepository
	{
		private readonly AppIdentityDbContext _context;

		public RefreshTokenRepository(AppIdentityDbContext context)
		{
			_context = context;
		}

		public IUnitOfWork UnitOfWork => _context;

		public void Add(RefreshToken refreshToken)
		{
			_context.RefreshTokens.AddAsync(refreshToken);
		}

		public void Dispose()
		{
			_context.Dispose();
		}

		public async Task<RefreshToken> GetByTokenIdAsync(Guid token)
		{
			return await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
		}

		public async Task<List<RefreshToken>> GetByUserIdAsync(string userId)
		{
			return await _context.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
		}

		public void Remove(RefreshToken refreshToken)
		{
			_context.RefreshTokens.Remove(refreshToken);
		}

		public void Update(RefreshToken refreshToken)
		{
			_context.RefreshTokens.Update(refreshToken);
		}
	}
}
