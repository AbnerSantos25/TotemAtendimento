using Totem.Common.Domain;
using Totem.Common.Domain.Entity;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public class ServiceType : Entity, IAggregateRoot
	{
		public string Title { get; private set; }
		public string? Icon { get; private set; }
		public HexColor? Color { get; private set; }
		public string TicketPrefix { get; private set; }
		public Guid TargetQueueId { get; private set; }
		public bool IsActive { get; private set; }

		protected ServiceType(){}

		public ServiceType(string title, string? icon, string? color, string ticketPrefix, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = CreateColor(color);
			TicketPrefix = ticketPrefix;
			TargetQueueId = targetQueueId;
		}

		private HexColor? CreateColor(string? color)
		{
			if (color is null) return null;
			return new HexColor(color);
		}

		public void Update(string title, string? icon, string? color, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = CreateColor(color);
			TargetQueueId = targetQueueId;
		}

		public void ToggleStatus()
		{
			IsActive = !IsActive;
		}
	}
}
