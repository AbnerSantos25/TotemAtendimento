using System.ComponentModel.DataAnnotations;
using Totem.Common.Domain.Notification;
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
			//if (ExecutarValidacao(new PasswordValidations(), new Password(code)){

			//}
		}
	}
}
