using Totem.Common.Domain.Notification;

public class Result
{
    public bool Success => !_notificacoes.Any();

    private readonly List<Notificacao> _notificacoes = new();

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
