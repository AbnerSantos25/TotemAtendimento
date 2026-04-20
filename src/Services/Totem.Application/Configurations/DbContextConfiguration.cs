using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Totem.Infra.Data;
using Totem.Infra.Data.IdentityData;

namespace Totem.Application.Configurations
{
	public static class DbContextConfiguration
	{
		public static void AddDbContexts(this IServiceCollection services, IConfiguration configuration)
		{
			var connectionString = configuration.GetConnectionString("DefaultConnection");

			services.AddDbContext<TotemDbContext>(options =>
				options.UseSqlServer(connectionString));

			services.AddDbContext<AppIdentityDbContext>(options =>
				options.UseSqlServer(connectionString));
		}
	}
}
