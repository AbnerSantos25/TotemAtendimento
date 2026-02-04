using Totem.Common.Domain;
using Totem.Common.Domain.Entity;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public class ServiceType : Entity, IAggregateRoot
	{
		public string Title { get; private set; }
		public string? Icon { get; private set; }
		public string Color { get; private set; }
		public string TicketPrefix { get; private set; }
		public Guid TargetQueueId { get; private set; }

		protected ServiceType(){}

		public ServiceType(string title, string? icon, string color, string ticketPrefix, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = color;
			TicketPrefix = ticketPrefix;
			TargetQueueId = targetQueueId;
		}

		public void Update(string title, string? icon, string color, Guid targetQueueId)
		{
			Title = title;
			Icon = icon;
			Color = color;
			TargetQueueId = targetQueueId;
		}
	}
}
