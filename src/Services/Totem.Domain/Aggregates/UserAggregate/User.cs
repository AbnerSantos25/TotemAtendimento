using Microsoft.AspNetCore.Identity;

namespace Totem.Domain.Aggregates.UserAggregate
{
	public class User : IdentityUser<Guid>
	{
		public string FullName { get; set; }

		public User()
		{
			Id = Guid.NewGuid();
		}
	}
}
