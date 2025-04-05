using Totem.Common.Domain;

namespace Totem.Common.Data
{
	public interface IRepository
	{
		public interface IRepository<T> : IDisposable where T : IAggregateRoot
		{
			IUnitOfWork UnitOfWork { get; }
		}
	}
}
