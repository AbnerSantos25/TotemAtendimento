using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class Queue : Entity, IAggregateRoot
	{
		public string Name { get; private set; }
		public bool Active { get; private set; }
		private readonly List<Password> _passwords = new();
		public IReadOnlyCollection<Password> Passwords => _passwords.AsReadOnly();

		public Queue(string name)
		{
			Name = name;
			Active = true;
		}

		public void AddPassword(Password password) => _passwords.Add(password);

		public void ToggleStatus() => Active = !Active;

		public void Update(string name)
		{
			Name = name;
		}
	}
}
