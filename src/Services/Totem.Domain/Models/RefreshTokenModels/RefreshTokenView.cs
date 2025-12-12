using Microsoft.AspNetCore.Identity;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.SharedKernel.Models;

namespace Totem.Domain.Models.RefreshTokenModels
{
	public class RefreshTokenView : IRefreshTokenView
	{
		public Guid Token { get; set; }
		public Guid UserId { get ;set ;}
		public DateTime CreatedAt { get ;set ;}
		public DateTime ExpiryDate { get ;set ;}
		public bool Revoked { get ;set ;}
		public Guid? ReplacedByToken { get ;set ;}

		public static implicit operator RefreshTokenView(RefreshToken refreshToken)
		{
			if (refreshToken == null) return null;

			return new RefreshTokenView
			{
				Token = refreshToken.Token,
				UserId = refreshToken.UserId,
				CreatedAt = refreshToken.CreatedAt,
				ExpiryDate = refreshToken.ExpiryDate,
				Revoked = refreshToken.Revoked,
				ReplacedByToken = refreshToken.ReplacedByToken
			};
		}
	}
}
