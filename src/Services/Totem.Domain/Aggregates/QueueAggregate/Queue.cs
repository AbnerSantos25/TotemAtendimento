using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class Queue : Entity, IAggregateRoot
	{
		public string Name { get; private set; }
		public bool IsActive { get; private set; }
		private readonly List<Password> _passwords = new();
		public IReadOnlyCollection<Password> Passwords => _passwords.AsReadOnly();

		public Queue(string name)
		{
			Name = name;
			IsActive = true;
		}

		public void AddPassword(Password password) => _passwords.Add(password);

		public void ToggleStatus() => IsActive = !IsActive;

		public void Update(string name)
		{
			Name = name;
		}
	}
}
