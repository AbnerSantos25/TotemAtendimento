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
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Infra.Data.Repositories.QueueRepository;
using Totem.Application.Services.QueueServices;
using Totem.Infra.Data.Queries.QueueQueries;
using Totem.Application.Services.IdentityServices;

namespace Totem.Application.Configurations
{
	public static class DependencyInjection
	{
		public static void TotemRegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<INotificador, Notificador>();
			services.AddScoped<PasswordValidations>();

			services.AddScoped<IPasswordRepository, PasswordRepository>();
			services.AddScoped<IPasswordQueries, PasswordQueries>();
			services.AddScoped<IPasswordService, PasswordService>();

			services.AddScoped<IServiceLocationRepository, ServiceLocationRepository>();
			services.AddScoped<IServiceLocationQueries, ServiceLocationQueries>();
			services.AddScoped<IServiceLocationService, ServiceLocationService>();

			services.AddScoped<IQueueRepository, QueueRespository>();
			services.AddScoped<IQueueQueries, QueueQueries>();
			services.AddScoped<IQueueServices, QueueService>();

			services.AddScoped<IIdentityService, IdentityService>();
		}
	}
}
