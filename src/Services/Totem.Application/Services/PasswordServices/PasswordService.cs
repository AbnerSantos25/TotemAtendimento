using MediatR;
using Totem.Application.Events.Contracts;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.PasswordModels;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.PasswordServices
{
	public class PasswordService : BaseService, IPasswordService, IPasswordIntegrationService
	{
		private readonly IPasswordRepository _passwordRepository;
		private readonly IPasswordQueries _passwordQueries;
		private readonly IMediator _mediator;

		public PasswordService(
			INotificator notificador,
			IPasswordRepository passwordRepository,
			IPasswordQueries passwordQueries,
			IMediator mediator
		) : base(notificador)
		{
			_passwordRepository = passwordRepository;
			_passwordQueries = passwordQueries;
			_mediator = mediator;
		}

		public async Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request)
		{
			var contract = PasswordConstructorValidation.AllowedAdd(request.QueueId);
			if (!contract.IsValid)
				return Unsuccessful<Guid>(contract);

			var password = new Password(request.QueueId, request.Preferential);

			password.IncrementCode(await _passwordRepository.GetNextPasswordCodeAsync());

			_passwordRepository.Add(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful<Guid>(Errors.ErrorSavingDatabase);

			await _mediator.Publish(new PasswordCreatedEvent(
				password.Id,
				password.QueueId,
				password.Code,
				password.CreatedAt,
				password.Preferential));

			return Successful(password.Id);
		}

		public async Task<Result> TransferPasswordAsync(Guid passwordId, PasswordTransferRequest passwordTransfer)
		{
			var password = await _passwordRepository.GetByIdAsync(passwordId);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound);

			if (!password.Validations.AllowedTransfer(passwordTransfer.QueueId))
				return Unsuccessful(password);

			var oldQueueId = password.QueueId;
			var oldQueueName = password.Queue.Name;

			password.AssignToQueue(passwordTransfer.QueueId);

			_passwordRepository.Update(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			await _mediator.Publish(new PasswordCreatedEvent(
				passwordId,
				passwordTransfer.QueueId,
				password.Code,
				password.CreatedAt,
				password.Preferential));

			await _mediator.Publish(new PasswordQueueChangedEvent(password.Id, oldQueueId, passwordTransfer.QueueId, password.Code, oldQueueName, passwordTransfer.Name));

			return Successful();
		}

		public async Task<(Result result, IPasswordView data)> ServiceLocationWaitingPasswordAsync(Guid queueId, Guid serviceLocationId, string newServiceLocationName)
		{
			var nextPassword = await _passwordRepository.GetNextUnassignedPasswordFromQueueAsync(queueId);
			
			if (nextPassword is null)
			{
				await _mediator.Publish(new ServiceLocationWaitingPasswordEvent(serviceLocationId, queueId));
				return Successful<IPasswordView>(null);
			}

			var oldServiceLocation = nextPassword.ServiceLocationId;
			var oldDescription = nextPassword.ServiceLocation?.Name ?? Labels.NoServiceLocation;

			if (!nextPassword.Validations.AllowedAssignToServiceLocation(serviceLocationId))
				return Unsuccessful<IPasswordView>(nextPassword);

			nextPassword.AssignToServiceLocation(serviceLocationId);

			_passwordRepository.Update(nextPassword);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful<IPasswordView>(Errors.ErrorSavingDatabase);

			await _mediator.Publish(new PasswordCalledEvent(
				nextPassword.Id,
				queueId,
				serviceLocationId,
				newServiceLocationName,
				oldServiceLocation,
				oldDescription,
				nextPassword.Code,
				nextPassword.Preferential));

			return Successful<PasswordView>(nextPassword);
		}

		public async Task<(Result result, PasswordView data)> GetByIdPasswordAsync(Guid id)
		{
			var password = await _passwordRepository.GetByIdAsync(id);
			if (password == null)
				return Unsuccessful<PasswordView>(Errors.PasswordNotFound);

			return Successful(password);
		}

		public async Task<(Result result, List<PasswordView> data)> GetListPasswordAsync(Guid queueId)
		{
			var passwords = await _passwordQueries.GetListPasswordsAsync(queueId);
			return Successful(passwords);
		}

		public async Task<Result> RemovePasswordAsync(Guid id)
		{
			var password = await _passwordRepository.GetByIdAsync(id);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound);

			_passwordRepository.Delete(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<Result> MarkAsServed(Guid passwordId)
		{
			var password = await _passwordRepository.GetByIdAsync(passwordId);
			if (password == null)
				return Unsuccessful(Errors.PasswordNotFound);

			if (!password.Validations.AllowedMarkAsServed())
				return Unsuccessful(password);

			var serviceLocationId = password.ServiceLocationId;
			var code = password.Code;

			password.MarkAsServed();

			_passwordRepository.Update(password);

			if (!await _passwordRepository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			await _mediator.Publish(new PasswordServedEvent(
				passwordId,
				password.QueueId,
				serviceLocationId ?? Guid.Empty,
				password.ServiceLocation?.Name ?? string.Empty,
				code,
				password.Preferential));

			return Successful();
		}

		public async Task<(Result result, List<AttendanceDisplayView> data)> GetLatestCallsAsync()
		{
			return Successful(await _passwordQueries.GetLatestCallsAsync());
		}
	}
}
