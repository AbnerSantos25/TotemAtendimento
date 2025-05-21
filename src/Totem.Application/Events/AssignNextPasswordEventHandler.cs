using MediatR;
using Totem.Application.Services.PasswordServices;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Application.Events
{
	public class AssignNextPasswordEventHandler : INotificationHandler<AssignNextPasswordEvent>
	{
		private readonly IPasswordService _passwordService;

		public AssignNextPasswordEventHandler(IPasswordService passwordService, IQueueRepository queueRepository)
		{
			_passwordService = passwordService;
		}

		public async Task Handle(AssignNextPasswordEvent notification, CancellationToken cancellationToken)
		{
			await _passwordService.AssignNextPasswordAsync(notification.QueueId, notification.ServiceLocationId, notification.Name);
		}
	}
}
