using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
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

		public async Task<List<AttendanceDisplayView>> GetLatestCallsAsync()
		{
			return _context.Passwords
				.Include(x => x.Queue)
				.Include(x => x.ServiceLocation)
				.Where(x => x.ServiceLocationId != null)
				.OrderByDescending(x => x.CreatedAt)
				.Take(6)
				.AsEnumerable()
				.Select((x, index) => new AttendanceDisplayView
				{
					PasswordCode = x.Code.ToString(),
					QueueName = x.Queue.Name,
					ServiceLocationName = x.ServiceLocation?.Name ?? "Sem local de atendimento",
					Index = index + 1
				})
				.ToList();
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
