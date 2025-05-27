using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Totem.Application.Services.IdentityServices;
using Totem.Application.Services.PasswordMatchingServices;
using Totem.Application.Services.PasswordServices;
using Totem.Application.Services.QueueServices;
using Totem.Application.Services.ServiceLocationServices;
using Totem.Common.Domain.Notification;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Infra.Data.Queries.PasswordQueries;
using Totem.Infra.Data.Queries.QueueQueries;
using Totem.Infra.Data.Queries.ServiceLocationQueries;
using Totem.Infra.Data.Repositories.PasswordRepository;
using Totem.Infra.Data.Repositories.QueueRepository;
using Totem.Infra.Data.Repositories.ServiceLocationRepository;
using Totem.SharedKernel.Services;

namespace Totem.Application.Configurations
{
	public static class DependencyInjection
	{
		public static void TotemRegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<INotificator, Notificator>();
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

            services.AddScoped<IPasswordMatchingService, PasswordMatchingService>();

			services.AddScoped<IPasswordHistoryRepository, PasswordHistoryRepository>();

			services.AddScoped<IPasswordIntegrationService, PasswordService>();
		}
	}
}
