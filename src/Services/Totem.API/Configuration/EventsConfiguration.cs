﻿using Totem.API.RealTime;
using Totem.Application.Events;
using Totem.Application.Events.Notifications;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.RefreshTokenAggregate.Events;

namespace Totem.API.Configuration
{
	public static class EventsConfiguration
	{
		public static void AddEventsConfiguration(this IServiceCollection services)
		{
			services.AddScoped<IRealTimeNotifier, SignalRNotifier>();

			services.AddMediatR(cfg =>
			{
				cfg.RegisterServicesFromAssemblyContaining<PasswordCreatedEvent>();
				cfg.RegisterServicesFromAssemblyContaining<PasswordMarkedAsServedHistoryEvent>();
				cfg.RegisterServicesFromAssembly(typeof(SaveRefreshTokenEventHandler).Assembly);
			});
		}

	}
}
