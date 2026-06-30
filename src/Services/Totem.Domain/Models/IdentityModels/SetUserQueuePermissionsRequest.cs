namespace Totem.Domain.Models.IdentityModels
{
	public class SetUserQueuePermissionsRequest
	{
		public List<Guid> QueueIds { get; set; } = new();
	}
}
