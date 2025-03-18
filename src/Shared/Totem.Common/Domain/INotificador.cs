using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Common.Domain
{
	public interface INotificador
	{
		bool TemNotificacao();
		List<Notificacao> ObterNotificacoes();
		void Handle(Notificacao notificacao);
	}

}
