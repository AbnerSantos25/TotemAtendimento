using Totem.Common.Domain.Notification;

namespace Totem.Common.Services
{
    public class Result : Notificador
    {
        public bool Success => this.IsValid;
        public string? ErrorMessage { get; }

        public Result() { }

    }
}
