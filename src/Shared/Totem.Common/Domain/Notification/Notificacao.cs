using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Common.Domain.Notification
{
	public class Notificacao //trocar par ao ingles
	{
		public Notificacao(string mensagem)
		{
			Mensagem = mensagem;
		}
		public string Mensagem { get; }
	}
}
