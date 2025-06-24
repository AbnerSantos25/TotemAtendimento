using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public interface IQueueRepository : IRepository<Queue>
	{
		void Add(Queue queue);
		void Update(Queue queue);
		void Delete(Queue queue);
		Task<Queue> GetByIdAsync(Guid id);
		Task<bool> ExistsAsync(string name);
	}
}
