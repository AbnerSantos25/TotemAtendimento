using Totem.API.RealTime;
using Totem.Application.Events;
using Totem.Application.Events.Notifications;

namespace Totem.API.Configuration
{
    public static class EventsConfiguration
    {
        public static void AddEventsConfiguration(this IServiceCollection services)
        {
            services.AddScoped<ISignalRNotifier, SignalRNotifier>();

            // Eventos e handlers vivem os dois em Totem.Application, entao uma unica
            // varredura basta. Antes eram tres registros: dois apontavam para o assembly
            // do dominio, onde os eventos ficavam, e todos acabavam no mesmo lugar.
            services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssemblyContaining<SaveRefreshTokenEventHandler>());
        }

    }
}
