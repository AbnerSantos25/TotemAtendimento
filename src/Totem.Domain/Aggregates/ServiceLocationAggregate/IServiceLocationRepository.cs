using Totem.Common.Data;
using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public interface IServiceLocationRepository : IRepository<ServiceLocation>
	{

		void Add(ServiceLocation serviceLocation);

		void Update(ServiceLocation serviceLocation);

		void Delete(ServiceLocation serviceLocation);

		Task<ServiceLocation> GetById(Guid id);

		Task<bool> ExistsAsync(string Name, int? number);
	}
}
