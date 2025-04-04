﻿using Microsoft.Extensions.DependencyInjection;
using Totem.Application.Services.PasswordServices;
using Totem.Application.Services.ServiceLocationServices;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Infra.Data.Queries.PasswordQueries;
using Totem.Infra.Data.Queries.ServiceLocationQueries;
using Totem.Infra.Data.Repositories.PasswordRepository;
using Totem.Infra.Data.Repositories.ServiceLocationRepository;

namespace Totem.Application.Configurations
{
	public static class DependencyInjection
	{
		public static void TotemRegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<PasswordValidations>();

			services.AddScoped<IPasswordService, PasswordService>();
			services.AddScoped<IPasswordRepository, PasswordRepository>();
			services.AddScoped<IPasswordQueries, PasswordQueries>();

			services.AddScoped<IServiceLocationRepository, ServiceLocationRepository>();
			services.AddScoped<IServiceLocationQueries, ServiceLocationQueries>();
			services.AddScoped<IServiceLocationService, ServiceLocationService>();

		}
	}
}
