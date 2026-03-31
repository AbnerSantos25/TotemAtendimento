using Totem.Domain.Aggregates.UserAggregate;

namespace Totem.Domain.Models.IdentityModels
{
	public class UserSummary
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public List<string> Roles { get; set; }

        public static implicit operator UserSummary(User user)
        {
            return new UserSummary
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                IsActive = user.IsActive
			};
		}
	}
}
