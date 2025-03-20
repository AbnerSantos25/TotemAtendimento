using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using System.Diagnostics;

namespace Totem.Common.API.Configurations
{
    public static class DatabaseTransactionConfiguration
    {
        public static IServiceCollection AddGenericDBContext<T>(this IServiceCollection services) where T : DbContext
        {
            services.AddDbContext<T>((serviceProvider, options) =>
            {
                var connection = serviceProvider.GetRequiredService<DbConnection>();
                options
                    .UseSqlServer(connection)
                    .EnableSensitiveDataLogging()
                    .LogTo(output => { Debug.WriteLine(output); }, LogLevel.Information);
            });

            return services;
        }
    }
}
