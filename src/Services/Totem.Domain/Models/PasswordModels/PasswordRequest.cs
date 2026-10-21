namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordRequest
    {
		public Guid QueueId { get; set; }
        public bool Preferential { get; set; }

    }
}
