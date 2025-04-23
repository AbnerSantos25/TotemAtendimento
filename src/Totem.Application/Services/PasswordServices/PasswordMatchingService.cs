using MediatR;
using Microsoft.AspNetCore.SignalR;
using Totem.Application.Events;
using Totem.Application.Events.Notifications;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Application.Services.PasswordServices
{
    public class PasswordMatchingService : INotificationHandler<PasswordCreatedEvent>, INotificationHandler<ServiceLocationReadyEvent>, IPasswordMatchingService
    {
        private readonly Dictionary<Guid, Queue<Guid>> _waitingPasswords = new();
        private readonly Dictionary<Guid, Queue<Guid>> _waitingLocations = new();

        private readonly IPasswordRepository _repo;
        private readonly IRealTimeNotifier _notifier;

        public PasswordMatchingService(
        IPasswordRepository repo,
        IRealTimeNotifier notifier)
        {
            _repo = repo;
            _notifier = notifier;
        }

        private async Task TryMatch(Guid queueId, Guid id, bool isPassword)
        {
            var pwQueue = _waitingPasswords.GetOrAdd(queueId);
            var slQueue = _waitingLocations.GetOrAdd(queueId);

            if (isPassword)
                pwQueue.Enqueue(id);
            else
                slQueue.Enqueue(id);

            // enquanto houver senha E location na mesma fila, faça o match
            while (pwQueue.Count > 0 && slQueue.Count > 0)
            {
                var pwdId = pwQueue.Dequeue();
                var slId = slQueue.Dequeue();

                // busca a entidade Password, atribui o ServiceLocation e salva
                var pwd = await _repo.GetByIdAsync(pwdId);
                pwd.AssignToServiceLocation(slId);
                _repo.Update(pwd);
                await _repo.UnitOfWork.CommitAsync();

                // opcional: notifique em tempo real via SignalR
                await _notifier.NotifyPasswordAssignedAsync(slId, pwd.Code, pwd.CreatedAt);
            }
        }

        // chegada de uma nova senha
        public async Task Handle(PasswordCreatedEvent evt, CancellationToken _) =>
            await TryMatch(evt.QueueId, evt.PasswordId, isPassword: true);

        // ServiceLocation pronto
        public async Task Handle(ServiceLocationReadyEvent evt, CancellationToken _) =>
            await TryMatch(evt.QueueId, evt.ServiceLocationId, isPassword: false);
    }

    static class DictExtensions
    {
        public static Queue<T> GetOrAdd<K, T>(this Dictionary<K, Queue<T>> dict, K key)
        {
            if (!dict.TryGetValue(key, out var q))
            {
                q = new Queue<T>();
                dict[key] = q;
            }
            return q;
        }
    }
}
