using MediatR;
using Totem.Application.Events.Notifications;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.PasswordAggregate.Events;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate.Events;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
	public class PasswordService : BaseService, IPasswordService
	{
		private readonly IPasswordRepository _passwordRepository;
		private readonly IPasswordQueries _passwordQueries;
		private readonly IMediator _mediator;
		private readonly IRealTimeNotifier _notifier;

		public PasswordService(INotificador notificador, IPasswordRepository passwordRepository, IPasswordQueries passwordQueries, PasswordValidations passwordValidation, IServiceLocationRepository serviceLocationRepository, IMediator mediator, IRealTimeNotifier notifier) : base(notificador)
		{
			_passwordRepository = passwordRepository;
			_passwordQueries = passwordQueries;
			_mediator = mediator;
			_notifier = notifier;
		}
		public async Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request)
		{
			var password = new Password(request.QueueId, request.Preferential);
			if (!ExecuteValidation(new PasswordValidations(), password))
				return Unsuccessful<Guid>();

			password.IncrementCode(await _passwordRepository.GetNextPasswordCodeAsync());

			_passwordRepository.Add(password);

            if (!await _passwordRepository.UnitOfWork.CommitAsync())
                return Unsuccessful<Guid>(Errors.ErrorSavingDatabase.ToString());
         
            await _mediator.Publish(new PasswordCreatedEvent(password.Id, password.QueueId));

			return Successful(password.Id);
		}


		public async Task<Result> TransferPasswordAsync(Guid passwordId, Guid queueId)
		{
			var password = await _passwordRepository.GetByIdAsync(passwordId);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound.ToString());

			password.AssignToQueue(queueId);

			_passwordRepository.Update(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase.ToString());

			await _mediator.Publish(new PasswordCreatedEvent(passwordId, queueId));

			return Successful();
		}

		public async Task<(Result result, PasswordView data)> AssignNextPasswordAsync(Guid queueId, Guid serviceLocationId)
		{
			var nextPassword = await _passwordRepository
				.GetNextUnassignedPasswordFromQueueAsync(queueId);

			if (nextPassword == null)
				return Successful<PasswordView>(null); // Não há senhas disponíveis na fila

			nextPassword.AssignToServiceLocation(serviceLocationId);

			_passwordRepository.Update(nextPassword);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful<PasswordView>(Errors.ErrorSavingDatabase.ToString());

			await _mediator.Publish(new ServiceLocationReadyEvent(serviceLocationId, queueId));

			return Successful(nextPassword);
		}

		public async Task<(Result result, PasswordView data)> GetByIdPasswordAsync(Guid id)
		{
			var password = await _passwordRepository.GetByIdAsync(id);
			if (password == null)
				return Unsuccessful<PasswordView>(Errors.PasswordNotFound.ToString());


			return Successful(password);
		}

		public async Task<(Result result, List<PasswordView> data)> GetListPasswordAsync()
		{
			var passwords = await _passwordQueries.GetListPasswordsAsync();
			return Successful(passwords);
		}

		public async Task<Result> RemovePasswordAsync(Guid id)
		{
			var password = await _passwordRepository.GetByIdAsync(id);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound.ToString());

			_passwordRepository.Delete(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase.ToString());

			return Successful();
		}

		public async Task<Result> MarkAsServed(Guid passwordId)
		{
			var password = await _passwordRepository.GetByIdAsync(passwordId);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound.ToString());

			if (password.ServiceLocation == null)
				return Unsuccessful(Errors.PasswordCannotBeServed.ToString());

			password.MarkAsServed();

			_passwordRepository.Update(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase.ToString());

			return Successful();
		}
	}
}
