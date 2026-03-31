using Microsoft.AspNetCore.Identity;

namespace Totem.Domain.Aggregates.UserAggregate
{
	public class User : IdentityUser<Guid>
	{
		public string FullName { get; private set; }

		public bool IsActive { get; private set; }

		public User(string fullName, string email)
		{
			Id = Guid.NewGuid();
			FullName = fullName;
			UserName = email;
			Email = email;
			EmailConfirmed = true;
			IsActive = true;
		}

		public void InactiveUser()
		{
			IsActive = false;
		}
		public void ActiveUser()
		{
			IsActive = true;
		}
	}
}
