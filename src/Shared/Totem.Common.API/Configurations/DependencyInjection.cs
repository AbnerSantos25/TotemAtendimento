﻿using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Data.Common;
using Totem.Common.Domain.Notification;

namespace Totem.Common.API.Configurations
{
	public static class DependencyInjection
	{
		public static void RegisterDependency(this IServiceCollection services, IConfiguration configuration)
		{
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddSingleton<DbConnection>(sp =>
            {
                return new SqlConnection(connectionString);
            });
		}
	}
}
