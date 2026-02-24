using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public interface IServiceTypeRepository : IRepository<ServiceType>
	{
		void Add(ServiceType serviceType);
		void Update(ServiceType serviceType);
		void Delete(ServiceType serviceType);
		Task<ServiceType> GetByIdAsync(Guid id);
		Task<bool> ExistsAsync(Guid queueId, string title, string ticketPrefix);
	}
}
