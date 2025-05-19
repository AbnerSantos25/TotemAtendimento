namespace Totem.Domain.Models.PasswordModels
{
	public class PasswordTransferRequest
	{
		public Guid QueueId { get; set; }
		public string Name { get; set; }
	}
}
