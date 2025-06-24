using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.RefreshTokenAggregate
{
	public interface IRefreshTokenRepository : IRepository<RefreshToken>
	{
		void Add(RefreshToken refreshToken);
		Task<RefreshToken> GetByTokenIdAsync(Guid token);
		void Remove(RefreshToken refreshToken);
		Task<List<RefreshToken>> GetByUserIdAsync(string userId);
		void Update(RefreshToken refreshToken);
	}
}
