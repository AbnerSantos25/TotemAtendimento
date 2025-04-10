using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Models.QueueModels;

namespace Totem.Infra.Data.Queries.QueueQueries
{
	public class QueueQueries : IQueueQueries
	{

		private readonly TotemDbContext _context;

		public QueueQueries(TotemDbContext context)
		{
			_context = context;
		}

		public async Task<List<QueueSummary>> GetListAsync()
		{
			var list = await _context
				.Queues
				.ToListAsync();

			List<QueueSummary> queueSummaries = list
				.Select(x => new QueueSummary
				{
					Id = x.Id,
					Name = x.Name,
					Active = x.Active
				}).ToList();

			return queueSummaries;
		}
		public async Task<QueueView> GetByIdAsync(Guid id)
		{
			return await _context.Queues.SingleOrDefaultAsync(x => x.Id == id);
		}
	}
}
