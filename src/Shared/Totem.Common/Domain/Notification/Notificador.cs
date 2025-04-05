using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Totem.Common.Domain.Notification
{
    public class Notificador : INotificador
    {
        private List<Notificacao> _notificacoes;

        [JsonIgnore, NotMapped]
        public bool IsValid => !_notificacoes.Any();
        public Notificador()
        {
            _notificacoes = new List<Notificacao>();
            Console.WriteLine($"-------------------------->>>>>>>>>>>> hashcode ",_notificacoes.GetHashCode());

        }

        public void AddNotifications(List<Notificacao> notificacoes)
        {
            _notificacoes.AddRange(notificacoes);
        }

        public void Handle(Notificacao notificacao)
        {
            _notificacoes.Add(notificacao);
        }

        public List<Notificacao> ObterNotificacoes()
        {
            return _notificacoes;
        }

        public bool TemNotificacao()
        {
            return _notificacoes.Any();
        }

    }
}
