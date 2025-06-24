using Totem.Common.Data;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Infra.Data.Repositories.PasswordRepository
{
	public class PasswordHistoryRepository : IPasswordHistoryRepository
	{
		private readonly TotemDbContext _context;

		public PasswordHistoryRepository(TotemDbContext context)
		{
			_context = context;
		}

		public IUnitOfWork UnitOfWork => _context;

		public async Task AddAsync(PasswordHistory history)
		{
			_context.PasswordHistories.Add(history);
		}

		public void Dispose()
		{
			_context?.Dispose();
		}
	}

}
