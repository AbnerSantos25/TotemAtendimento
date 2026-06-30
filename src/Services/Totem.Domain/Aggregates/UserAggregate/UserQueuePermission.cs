namespace Totem.Domain.Aggregates.UserAggregate
{
	/// <summary>
	/// Represents the permission of a user to attend a specific queue.
	/// FK is logical (no DB constraint) since UserId and QueueId live in
	/// different schemas (Identity and Totem) on the same database.
	/// </summary>
	public class UserQueuePermission
	{
		public Guid UserId { get; private set; }
		public Guid QueueId { get; private set; }

		private UserQueuePermission() { }

		public UserQueuePermission(Guid userId, Guid queueId)
		{
			UserId = userId;
			QueueId = queueId;
		}
	}
}
