using Totem.Domain.Models.QueueModels;

namespace Totem.Application.Services.QueueServices
{
	public interface IQueueServices
	{
		public Task<Result> AddAsync(QueueRequest request);
		public Task<Result> UpdateAsync(Guid Id, QueueRequest request);
		public Task<Result> DeleteAsync(Guid id);
		public Task<(Result result, List<QueueSummary> data)> GetListAsync();
		public Task<(Result result, QueueView data)> GetByIdAsync(Guid id);
		public Task<Result> ToggleStatusQueue(Guid id);
	}
}
