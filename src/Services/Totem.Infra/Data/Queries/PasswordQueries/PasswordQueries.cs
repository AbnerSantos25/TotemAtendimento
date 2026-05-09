using Microsoft.EntityFrameworkCore;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Infra.Data.Queries.PasswordQueries
{
	public class PasswordQueries : IPasswordQueries
	{
		private readonly TotemDbContext _context;

		public PasswordQueries(TotemDbContext context)
		{
			_context = context;
		}

		public async Task<List<PasswordView>> GetListPasswordsAsync(Guid queueId)
		{
			var list = await _context.Passwords
				.Include(x => x.ServiceLocation)
				.Where(x => x.QueueId == queueId)
				.OrderByDescending(x => x.Preferential)
				.ThenBy(x => x.CreatedAt)
				.ToListAsync();

			return list.Select(password => (PasswordView)password).ToList();
		}

	}
}
