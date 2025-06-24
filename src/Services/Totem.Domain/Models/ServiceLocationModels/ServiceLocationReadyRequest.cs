namespace Totem.Domain.Models.ServiceLocationModels
{
	public class ServiceLocationReadyRequest
	{
		public Guid QueueId { get; set; }
		public string Name { get; set; }
	}
}
