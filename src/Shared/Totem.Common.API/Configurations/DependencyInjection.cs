using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Common.Domain;

namespace Totem.Common.API.Configurations
{
	public static class DependencyInjection
	{
		public static void RegisterDependency(this IServiceCollection services)
		{
			services.AddScoped<INotificador, Notificador>();
		}
	}
}
