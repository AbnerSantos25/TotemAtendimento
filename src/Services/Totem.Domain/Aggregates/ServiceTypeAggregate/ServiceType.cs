using Totem.Common.Domain;
using Totem.Common.Domain.Entity;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public record HexColor
	{
		public string Value { get; }

		public HexColor(string value)
		{
			if (string.IsNullOrWhiteSpace(value) || !value.StartsWith("#") || value.Length > 7)
				throw new ArgumentException("Cor inválida.");

			Value = value;
		}

		public override string ToString()
		{
			return Value;
		}
	}

	public class ServiceType : Entity, IAggregateRoot
	{
		public string Title { get; private set; }
		public string? Icon { get; private set; }
		public HexColor Color { get; private set; }
		public string TicketPrefix { get; private set; }
		public Guid TargetQueueId { get; private set; }
		public bool IsActive { get; private set; }

		protected ServiceType(){}

		public ServiceType(string title, string? icon, string color, string ticketPrefix, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = new HexColor(color);
			TicketPrefix = ticketPrefix;
			TargetQueueId = targetQueueId;
		}

		public void Update(string title, string? icon, string color, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = new HexColor(color);
			TargetQueueId = targetQueueId;
		}

		public void ToggleStatus()
		{
			IsActive = !IsActive;
		}
	}
}
