using Totem.Common.Validation;

namespace Totem.Domain.Models.ServiceTypeModels
{
	public class ServiceTypeRequest
	{
		[RequiredValidation]
		public string Title { get; set; }
		public string? Icon { get; set; }
		public string? Color { get; set; }
		public string TicketPrefix { get; set; }
		[RequiredValidation]
		public Guid TargetQueueId { get; set; }
	}
}
