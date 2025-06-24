using Totem.Common.Domain;
using Totem.Common.Domain.Entity;

namespace Totem.Domain.Aggregates.RefreshTokenAggregate
{
	public class RefreshToken : Entity, IAggregateRoot
	{
		public Guid Token { get; private set; }
		public string UserId { get; private set; }
		public DateTime CreatedAt { get; private set; } 
		public DateTime ExpiryDate { get; private set; }
		public bool Revoked { get; private set; }
		public Guid? ReplacedByToken { get; private set; }
		protected RefreshToken()
		{
		}
		public RefreshToken(Guid token, string userId, DateTime expiryDate, bool revoked)
		{
			Token = token;
			UserId = userId;
			CreatedAt = DateTime.UtcNow;
			ExpiryDate = expiryDate;
			Revoked = revoked;
		}

		public void Revoke(Guid? replacedByToken)
		{
			Revoked = true;
			ReplacedByToken = replacedByToken;
		}
	}
}
