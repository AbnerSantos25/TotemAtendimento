namespace Totem.Common.Domain.Notification
{
    public interface INotificador
    {
        public void AddNotifications(List<Notificacao> notificacoes);
        public void Handle(Notificacao notificacao);
        public List<Notificacao> ObterNotificacoes();
        public bool TemNotificacao();
    }

}
