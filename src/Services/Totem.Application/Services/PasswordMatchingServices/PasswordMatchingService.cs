using MediatR;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate.Events;

namespace Totem.Application.Services.PasswordMatchingServices
{
	/// <summary>
	/// Casa senhas recem-criadas com guiches que pediram atendimento e nao tinham
	/// senha disponivel no momento.
	///
	/// ServiceLocationWaitingPasswordEvent so e publicado quando a fila esta vazia
	/// (ver PasswordService.ServiceLocationWaitingPasswordAsync), entao basta guardar
	/// os guiches em espera: a proxima senha criada na fila e atribuida ao primeiro
	/// deles. O estado vive no IWaitingServiceLocationStore, que e Singleton -- este
	/// handler e recriado a cada evento e nao pode guardar estado em campo proprio.
	/// </summary>
	public class PasswordMatchingService : BaseService,
		INotificationHandler<PasswordCreatedEvent>,
		INotificationHandler<ServiceLocationWaitingPasswordEvent>,
		IPasswordMatchingService
	{
		private readonly IPasswordRepository _passwordRepository;
		private readonly IServiceLocationRepository _serviceLocationRepository;
		private readonly IWaitingServiceLocationStore _waitingLocations;
		private readonly IMediator _mediator;

		public PasswordMatchingService(
			INotificator notificador,
			IPasswordRepository passwordRepository,
			IServiceLocationRepository serviceLocationRepository,
			IWaitingServiceLocationStore waitingLocations,
			IMediator mediator) : base(notificador)
		{
			_passwordRepository = passwordRepository;
			_serviceLocationRepository = serviceLocationRepository;
			_waitingLocations = waitingLocations;
			_mediator = mediator;
		}

		public Task Handle(ServiceLocationWaitingPasswordEvent notification, CancellationToken cancellationToken)
		{
			_waitingLocations.Enqueue(notification.QueueId, notification.ServiceLocationId);
			return Task.CompletedTask;
		}

		public async Task Handle(PasswordCreatedEvent notification, CancellationToken cancellationToken)
		{
			if (!_waitingLocations.TryDequeue(notification.QueueId, out var serviceLocationId))
				return;

			var password = await _passwordRepository.GetByIdAsync(notification.PasswordId);
			if (password is null || !password.CanBeReassigned)
				return;

			var serviceLocation = await _serviceLocationRepository.GetByIdAsync(serviceLocationId);
			if (serviceLocation is null)
				return;

			password.AssignToServiceLocation(serviceLocationId);
			_passwordRepository.Update(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
			{
				// Devolve o guiche a espera para que ele nao perca a vez.
				_waitingLocations.Enqueue(notification.QueueId, serviceLocationId);
				return;
			}

			// Senha recem-criada nunca teve guiche anterior.
			await _mediator.Publish(new PasswordCalledEvent(
				password.Id,
				password.QueueId,
				serviceLocationId,
				serviceLocation.Name,
				null,
				Labels.NoServiceLocation,
				password.Code,
				password.Preferential), cancellationToken);
		}
	}
}
