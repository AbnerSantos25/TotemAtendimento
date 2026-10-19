using Totem.Common.Validation;

namespace Totem.Common.Domain.Entity
{
	public abstract class Entity : Contract
	{
		public Guid Id { get; private set; }

		protected Entity()
		{
			Id = Guid.NewGuid();
        }
	}
}
