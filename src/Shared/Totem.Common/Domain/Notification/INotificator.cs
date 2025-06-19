namespace Totem.Common.Domain.Notification
{
    public interface INotificator
    {      
        public void AddNotifications(List<Notification> notifications);
        public void Handle(Notification notification);
		public List<Notification> GetNotifications();
        public bool HasNotifications();
    }

}
