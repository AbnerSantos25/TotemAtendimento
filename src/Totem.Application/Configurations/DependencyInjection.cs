using Microsoft.Extensions.DependencyInjection;
using Totem.Application.Services.PasswordServices;
using Totem.Common.Domain.Notification;
using Totem.Application.Services.ServiceLocationServices;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Infra.Data.Queries.PasswordQueries;
using Totem.Infra.Data.Queries.ServiceLocationQueries;
using Totem.Infra.Data.Repositories.PasswordRepository;
using Totem.Infra.Data.Repositories.ServiceLocationRepository;
using Totem.Application.Services.IdentityServices;

namespace Totem.Application.Configurations
{
	public static class DependencyInjection
	{
		public static void TotemRegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<IPasswordService, PasswordService>();
			services.AddScoped<PasswordValidations>();
			services.AddScoped<IPasswordRepository, PasswordRepository>();
			services.AddScoped<IPasswordQueries, PasswordQueries>();
			services.AddScoped<INotificador, Notificador>();

			services.AddScoped<IServiceLocationRepository, ServiceLocationRepository>();
			services.AddScoped<IServiceLocationQueries, ServiceLocationQueries>();
			services.AddScoped<IServiceLocationService, ServiceLocationService>();

			services.AddScoped<IIdentityService, IdentityService>();

        }
	}
}
