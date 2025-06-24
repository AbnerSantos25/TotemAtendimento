using Totem.Domain.Models.QueueModels;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public interface IQueueQueries
	{
		Task<QueueView> GetByIdAsync(Guid id);
		Task<List<QueueSummary>> GetListAsync();

	}
}
