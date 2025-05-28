using Totem.Common.Domain.Notification;

public class Result
{
    public bool Success => !_notifications.Any();

    private readonly List<Notification> _notifications = new();

    public void Handle(Notification notificacao)
    {
        _notifications.Add(notificacao);
    }

	public void Handle(List<Notification> notificacoes)
	{
		_notifications.AddRange(notificacoes);
	}

	public List<Notification> GetNotifications()
    {
        return _notifications;
    }

    public bool HasNotifications()
    {
        return _notifications.Any();
    }
}
