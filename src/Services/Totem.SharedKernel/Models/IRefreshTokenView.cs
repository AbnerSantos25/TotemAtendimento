namespace Totem.SharedKernel.Models
{
	public interface IRefreshTokenView
	{
		public Guid Token { get; set; }
		public Guid UserId { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime ExpiryDate { get; set; }
		public bool Revoked { get; set; }
		public Guid? ReplacedByToken { get; set; }
	}
}
