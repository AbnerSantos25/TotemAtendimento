using MediatR;
using Totem.Application.Services.PasswordServices;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Application.Events
{
    public class AssignNextPasswordRequestedEventHandler : INotificationHandler<AssignNextPasswordRequestedEvent>
    {
        private readonly IPasswordService _passwordService;

        public AssignNextPasswordRequestedEventHandler(IPasswordService passwordService, IQueueRepository queueRepository)
        {
            _passwordService = passwordService;
        }

        public async Task Handle(AssignNextPasswordRequestedEvent notification, CancellationToken cancellationToken)
        {
            //TODO: (Abner) aqui talves poderia ter as validações se a queueId e serviceLocationId são válidos,
            //mas pra isso eu teria que injetar o repository de ServiceLocation e Queue

            await _passwordService.AssignNextPasswordAsync(notification.QueueId, notification.ServiceLocationId);
        }
    }


}
