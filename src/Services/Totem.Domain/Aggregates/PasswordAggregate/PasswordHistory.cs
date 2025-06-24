using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Enumerations;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class PasswordHistory : Entity, IAggregateRoot
	{
		public Guid PasswordId { get; private set; }
		public DateTime Timestamp { get; private set; }
		public PasswordHistoryEventType PasswordHistoryEventType { get; private set; }
		public string Description { get; private set; }
		public string? OldValue { get; private set; }
		public string? NewValue { get; private set; }

		protected PasswordHistory() { }

		public PasswordHistory(Guid passwordId, PasswordHistoryEventType passwordHistoryEventType, string description, string? oldValue = null, string? newValue = null)
		{
			PasswordId = passwordId;
			Timestamp = DateTime.UtcNow;
			PasswordHistoryEventType = passwordHistoryEventType;
			Description = description;
			OldValue = oldValue;
			NewValue = newValue;
		}
	}

}
