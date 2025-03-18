using System.ComponentModel.DataAnnotations;
using Totem.Common.Data;
using Totem.Common.Domain;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Application.Services.PasswordServices
{
	public class PasswordService : BaseService, IPasswordServices
	{

		public PasswordService(INotificador notificador) : base(notificador)
		{
		}

		public async Task AddPasswordAsync(string code)
		{
			if (ExecutarValidacao(new PasswordValidations(), new Password(code)){

			}
		}
	}
}
