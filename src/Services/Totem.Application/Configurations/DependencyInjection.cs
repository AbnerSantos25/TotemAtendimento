using Microsoft.Extensions.DependencyInjection;
using Totem.Application.Services.IdentityServices;
using Totem.Application.Services.PasswordMatchingServices;
using Totem.Application.Services.PasswordServices;
using Totem.Application.Services.QueueServices;
using Totem.Application.Services.RefreshTokenServices;
using Totem.Application.Services.ServiceLocationServices;
using Totem.Application.Services.ServiceTypeServices;
using Totem.Common.Domain.Notification;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.ServiceTypeAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Infra.Data.Queries.PasswordQueries;
using Totem.Infra.Data.Queries.QueueQueries;
using Totem.Infra.Data.Queries.ServiceLocationQueries;
using Totem.Infra.Data.Queries.ServiceTypeQueries;
using Totem.Infra.Data.Repositories.PasswordRepository;
using Totem.Infra.Data.Repositories.QueueRepository;
using Totem.Infra.Data.Repositories.RefreshTokenRepository;
using Totem.Infra.Data.Repositories.ServiceLocationRepository;
using Totem.Infra.Data.Repositories.ServiceTypeRepository;
using Totem.Infra.Data.Repositories.UserQueuePermissionRepository;
using Totem.SharedKernel.Services;

namespace Totem.Application.Configurations
{
	public static class DependencyInjection
	{
		public static void TotemRegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<INotificator, Notificator>();

			services.AddScoped<IPasswordRepository, PasswordRepository>();
			services.AddScoped<IPasswordQueries, PasswordQueries>();
			services.AddScoped<IPasswordService, PasswordService>();

			services.AddScoped<IServiceLocationRepository, ServiceLocationRepository>();
			services.AddScoped<IServiceLocationQueries, ServiceLocationQueries>();
			services.AddScoped<IServiceLocationService, ServiceLocationService>();

			services.AddScoped<IQueueRepository, QueueRepository>();
			services.AddScoped<IQueueQueries, QueueQueries>();
			services.AddScoped<IQueueServices, QueueService>();

			services.AddScoped<IIdentityService, IdentityService>();
			services.AddScoped<IIdentityIntegrationService, IdentityService>();
			services.AddScoped<IUserQueuePermissionService, UserQueuePermissionService>();
			services.AddScoped<IUserQueuePermissionRepository, UserQueuePermissionRepository>();

            services.AddScoped<IPasswordMatchingService, PasswordMatchingService>();

			// Estado efemero dos guiches em espera: precisa sobreviver entre requisicoes,
			// ao contrario do handler, que e recriado a cada evento.
			services.AddSingleton<IWaitingServiceLocationStore, WaitingServiceLocationStore>();

			services.AddScoped<IPasswordHistoryRepository, PasswordHistoryRepository>();

			services.AddScoped<IPasswordIntegrationService, PasswordService>();

			services.AddScoped<IRefreshTokenService, RefreshTokenService>();

			services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

			services.AddScoped<IServiceTypeService, ServiceTypeService>();
			services.AddScoped<IServiceTypeQueries, ServiceTypeQueries>();
			services.AddScoped<IServiceTypeRepository, ServiceTypeRepository>();

		}
	}
}
