using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Infra.Data.Repositories.QueueRepository
{
	public class QueueRespository : IQueueRepository
	{
		private readonly TotemDbContext _context;

		public IUnitOfWork UnitOfWork => _context;

		public QueueRespository(TotemDbContext context)
		{
			_context = context;
		}

		public async Task<bool> ExistsAsync(string name)
		{
			return _context.Queues.Any(x => x.Name == name);
		}

		public void Add(Queue queue)
		{
			_context.Add(queue);
		}

		public void Delete(Queue queue)
		{
			_context.Remove(queue);
		}

		public void Update(Queue queue)
		{
			_context.Update(queue);
		}

		public async Task<Queue> GetByIdAsync(Guid id)
		{
			return await _context.Queues.SingleOrDefaultAsync(x => x.Id == id);
		}

		public void Dispose()
		{
			_context.Dispose();
		}
	}
}
