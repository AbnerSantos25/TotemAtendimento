using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Totem.Common.Validation
{
	/// <summary>
	/// Acumula as notificações de validação. [NotMapped] e [JsonIgnore] impedem que vazem para o banco e para a API.
	/// </summary>
	public abstract class Notifiable
	{
		private readonly List<Domain.Notification.Notification> _notifications = new();

		[NotMapped, JsonIgnore]
		public IReadOnlyCollection<Domain.Notification.Notification> Notifications => _notifications;

		[NotMapped, JsonIgnore]
		public bool IsValid => _notifications.Count == 0;

		public void AddNotification(string message, params object[] args) =>
			_notifications.Add(new Domain.Notification.Notification(args.Length == 0 ? message : string.Format(message, args)));

		public void AddNotifications(IEnumerable<Domain.Notification.Notification> notifications) =>
			_notifications.AddRange(notifications);

		public void AddNotifications(Notifiable other) => AddNotifications(other.Notifications);
	}
}
