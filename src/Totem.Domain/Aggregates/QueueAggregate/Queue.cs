using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class Queue : Entity
	{
		public string Name { get; private set; }
		public bool Active { get; private set; }
		private readonly List<Password> _passwords = new();
		public IReadOnlyCollection<Password> Passwords => _passwords.AsReadOnly();

		public Queue(string name)
		{
			//TODO: Validations
			Name = name;
			Active = true;
		}

		public void AddPassword(Password password) => _passwords.Add(password);

		public void ChangeStatus(bool ativo) => Active = ativo;

	}
}
