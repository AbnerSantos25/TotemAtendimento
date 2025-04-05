using Microsoft.Extensions.DependencyInjection;
using Totem.Application.Services.PasswordServices;
using Totem.Common.Domain.Notification;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Infra.Data.Queries.PasswordQueries;
using Totem.Infra.Data.Repositories.PasswordRepository;

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

        }
    }
}
