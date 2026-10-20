using Totem.Common.Domain.Notification;
using Totem.Common.Validation;

namespace Totem.Common.Services
{
	public abstract class BaseService
	{

	private readonly INotificator _notificator;

		protected BaseService(INotificator notificator)
		{
			_notificator = notificator;
		}

		protected void Notify(string mensagem)
		{
			_notificator.Handle(new Notification(mensagem));
		}

		protected Result Successful()
		{
			return new Result();
		}

		protected (Result result, T data) Successful<T>()
		{
			return (new Result(), default(T));
		}

		protected (Result result, T data) Successful<T>(T data)
		{
			return (new Result(), data);
		}

		protected Result Unsuccessful(List<Notification> notifications)
		{
			var result = new Result();
			result.Handle(notifications);
			return result;
		}

		protected (Result result, T data) Unsuccessful<T>(List<Notification> notifications)
		{
			return (Unsuccessful(notifications), default(T));
		}

		protected Result Unsuccessful(Notifiable notifiable)
		{
			var result = new Result();
			result.Handle(notifiable.Notifications);
			return result;
		}

		protected (Result result, T data) Unsuccessful<T>(Notifiable notifiable)
		{
			return (Unsuccessful(notifiable), default(T));
		}

		protected (Result result, T data) Unsuccessful<T>()
		{
			return (Unsuccessful(), default(T));
		}
		protected (Result result, T data) Unsuccessful<T>(string message)
		{
			return (Unsuccessful(message), default(T));
		}
		protected Result Unsuccessful(string message)
		{
			var result = new Result();
			result.Handle(new Notification(message));
			return result;
		}
		protected Result Unsuccessful()
		{
			var result = new Result();
			result.Handle(_notificator.GetNotifications());
			return result;
		}

	}

}
