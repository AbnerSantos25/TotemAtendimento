﻿using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;

namespace Totem.Common.API.Configurations
{
	public static class DependencyInjection
	{
		public static void RegisterDependency(this IServiceCollection services, IConfiguration configuration)
		{

			services.AddScoped<INotificador, Notificador>();

			var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddSingleton<DbConnection>(sp =>
            {
                return new SqlConnection(connectionString);
            });

			//services.AddSingleton(typeof(IStringLocalizer<Labels>), typeof(ResourceManagerStringLocalizer<Labels>));

		}
	}
}
