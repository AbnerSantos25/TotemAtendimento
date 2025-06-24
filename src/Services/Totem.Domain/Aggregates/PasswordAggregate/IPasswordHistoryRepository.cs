using Totem.Common.Data;
using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public interface IPasswordHistoryRepository : IRepository<PasswordHistory>
	{
		Task AddAsync(PasswordHistory history);
	}

}
