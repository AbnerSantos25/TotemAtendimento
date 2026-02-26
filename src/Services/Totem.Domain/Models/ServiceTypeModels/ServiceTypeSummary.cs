using Totem.Domain.Aggregates.ServiceTypeAggregate;

namespace Totem.Domain.Models.ServiceTypeModels
{
	public class ServiceTypeSummary
	{
		public Guid ServiceTypeId { get; set; }
		public string Title { get; set; }
		public string? Icon { get; set; }
		public string Color { get; set; }
		public string TicketPrefix { get; set; }
		public Guid TargetQueueId { get; set; }
		public bool IsActive { get; set; }

		public static implicit operator ServiceTypeSummary(ServiceType entity)
		{
			if (entity == null) return null;
			return new ServiceTypeSummary
			{
				ServiceTypeId = entity.Id,
				Title = entity.Title,
				Icon = entity.Icon,
				Color = entity.Color.ToString(),
				TicketPrefix = entity.TicketPrefix,
				TargetQueueId = entity.TargetQueueId,
				IsActive = entity.IsActive
			};
		}
	}
}
