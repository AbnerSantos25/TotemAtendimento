using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain;
using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class Queue : Entity, IAggregateRoot
	{
		public const int NameMaxLength = 100;

		public string Name { get; private set; }
		public bool IsActive { get; private set; }

		private readonly List<Password> _passwords = new();
		public IReadOnlyCollection<Password> Passwords => _passwords.AsReadOnly();

		private QueueValidation? _validations;
		[NotMapped, JsonIgnore]
		public QueueValidation Validations => _validations ??= new(this);

		protected Queue() {}

		public Queue(string name, bool isActive = true)
		{
			if (!Validations.AllowedAdd(name))
				throw new DomainException(Errors.UnableCreateQueue);

			Name = name;
			IsActive = isActive;
		}

		public void AddPassword(Password password) => _passwords.Add(password);

		public void ToggleStatus() => IsActive = !IsActive;

		public void Update(string name)
		{
			if (!IsValid || !Validations.AllowedUpdate(name))
				throw new DomainException(Errors.UnableUpdateQueue);

			Name = name;
		}
	}
}
