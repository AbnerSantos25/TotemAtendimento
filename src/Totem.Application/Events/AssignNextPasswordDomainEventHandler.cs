using MediatR;
using Totem.Application.Services.PasswordServices;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Application.Events
{
    public class AssignNextPasswordDomainEventHandler : INotificationHandler<AssignNextPasswordDomainEvent>
    {
        private readonly IPasswordService _passwordService;
        private readonly IQueueRepository _queueRepository;

        public AssignNextPasswordDomainEventHandler(IPasswordService passwordService, IQueueRepository queueRepository)
        {
            _passwordService = passwordService;
            _queueRepository = queueRepository;
        }

        public async Task Handle(AssignNextPasswordDomainEvent notification, CancellationToken cancellationToken)
        {
            //TODO: (Abner) aqui talves poderia ter as validações se a queueId e serviceLocationId são válidos,
            //mas pra isso eu teria que injetar o repository de ServiceLocation e Queue

            await _passwordService.AssignNextPasswordAsync(notification.QueueId, notification.ServiceLocationId);
        }
    }
}
