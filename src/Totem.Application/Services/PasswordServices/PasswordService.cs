using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;

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
