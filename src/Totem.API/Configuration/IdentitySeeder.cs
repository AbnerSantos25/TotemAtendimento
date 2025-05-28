using Microsoft.AspNetCore.Identity;
using Totem.Common.Enumerations;

namespace Totem.API.Configuration
{
	public static class IdentitySeeder
	{
		public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
		{
			var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

			var roles = Enum.GetNames(typeof(EnumRoles));

			foreach (var role in roles)
			{
				if (!await roleManager.RoleExistsAsync(role))
				{
					await roleManager.CreateAsync(new IdentityRole(role));
				}
			}
		}
	}
}
