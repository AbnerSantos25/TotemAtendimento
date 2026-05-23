namespace Totem.API.Configuration
{
	public static class SeedConfiguration
	{
		public static async Task InitializeDatabaseAsync(this IServiceProvider serviceProvider)
		{
			using (var scope = serviceProvider.CreateScope())
			{
				await IdentitySeeder.SeedRolesAsync(scope.ServiceProvider);
			}
		}
	}
}
