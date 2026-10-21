namespace Totem.Domain.Models.ServiceTypeModels
{
	public class ServiceTypeRequest
	{
		public string Title { get; set; }
		public string? Icon { get; set; }
		public string? Color { get; set; }
		public string? TicketPrefix { get; set; }
		public Guid TargetQueueId { get; set; }
	}
}
