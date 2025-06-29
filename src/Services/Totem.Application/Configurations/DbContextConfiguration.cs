﻿using Microsoft.Extensions.DependencyInjection;
using Totem.Common.API.Configurations;
using Totem.Infra.Data;
using Totem.Infra.Data.IdentityData;

namespace Totem.Application.Configurations
{
	public static class DbContextConfiguration
	{
		public static void AddDbContexts(this IServiceCollection services)
		{
			services.AddGenericDBContext<TotemDbContext>();
			services.AddGenericDBContext<AppIdentityDbContext>();
        }
	}
}
