using System.ComponentModel.DataAnnotations;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Application.Services.PasswordServices
{
	public class PasswordService : BaseService, IPasswordService
	{

		public PasswordService(INotificador notificador) : base(notificador)
		{
		}

		public async Task AddPasswordAsync(string code)
		{
			var teste = Labels.ServiceLocator;
			//if (ExecutarValidacao(new PasswordValidations(), new Password(code)){

			//}
		}
	}
}
