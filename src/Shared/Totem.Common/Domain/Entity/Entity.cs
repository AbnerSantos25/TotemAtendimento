namespace Totem.Common.Domain.Entity
{
	public abstract class Entity
	{
		public Guid Id { get; private set; }

		protected Entity()
		{
			Id = Guid.NewGuid();
        }
	}
}
