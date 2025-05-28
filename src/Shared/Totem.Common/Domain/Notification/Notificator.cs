using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Totem.Common.Domain.Notification
{
    public class Notificator : INotificator
    {
        private List<Notification> _notificacoes;

        [JsonIgnore, NotMapped]
        public bool IsValid => !_notificacoes.Any();
        public Notificator()
        {
            _notificacoes = new List<Notification>();
        }

        public void AddNotifications(List<Notification> notificacoes)
        {
            _notificacoes.AddRange(notificacoes);
        }

        public void Handle(Notification notificacao)
        {
            _notificacoes.Add(notificacao);
        }

        public List<Notification> GetNotifications()
        {
            return _notificacoes;
        }

        public bool HasNotifications()
        {
            return _notificacoes.Any();
        }

    }
}
