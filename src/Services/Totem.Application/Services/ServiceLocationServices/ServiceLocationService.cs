using MediatR;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Application.Events.Contracts;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Models.ServiceLocationModels;
using Totem.Application.Services.PasswordMatchingServices;
using Totem.SharedKernel.Models;
using Totem.SharedKernel.Services;

namespace Totem.Application.Services.ServiceLocationServices
{
	public class ServiceLocationService : BaseService, IServiceLocationService
	{
		private readonly IServiceLocationRepository _repository;
		private readonly IServiceLocationQueries _queries;
		private readonly IPasswordIntegrationService _passwordIntegrationService;
		private readonly IPasswordRepository _passwordRepository;
		private readonly IWaitingServiceLocationStore _waitingLocations;
		private readonly IMediator _mediator;

		public ServiceLocationService(
			INotificator notificador,
			IServiceLocationRepository repository,
			IServiceLocationQueries queries,
			IPasswordIntegrationService passwordIntegrationService,
			IPasswordRepository passwordRepository,
			IWaitingServiceLocationStore waitingLocations,
			IMediator mediator
		) : base(notificador)
		{
			_repository = repository;
			_queries = queries;
			_passwordIntegrationService = passwordIntegrationService;
			_passwordRepository = passwordRepository;
			_waitingLocations = waitingLocations;
			_mediator = mediator;
		}

		public async Task<(Result result, Guid data)> AddAsync(ServiceLocationRequest request)
		{
			var contract = ServiceLocationConstructorValidation.AllowedAdd(request.Name, request.Number);
			if (!contract.IsValid)
				return Unsuccessful<Guid>(contract);

			if (await _repository.ExistsAsync(request.Name, request.Number))
				return Unsuccessful<Guid>(Errors.RegisterAlreadyExists);

			var serviceLocation = new ServiceLocation(request.Name, request.Number);

			_repository.Add(serviceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful<Guid>(Errors.ErrorSavingDatabase);

			return Successful(serviceLocation.Id);
		}

		public async Task<Result> DeleteAsync(Guid Id)
		{
			var serviceLocation = await _repository.GetByIdAsync(Id);

			if (serviceLocation is null)
				return Unsuccessful(Errors.NotFound);

			_repository.Delete(serviceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			// Guiche excluido nao pode continuar esperando senha indefinidamente.
			_waitingLocations.RemoveServiceLocation(Id);

			return Successful();
		}

		public async Task<Result> UpdateAsync(Guid Id, ServiceLocationRequest request)
		{
			var serviceLocation = await _repository.GetByIdAsync(Id);
			if (serviceLocation is null)
				return Unsuccessful(Errors.NotFound);

			if (!serviceLocation.Validations.AllowedUpdate(request.Name, request.Number))
				return Unsuccessful(serviceLocation);

			if (await _repository.ExistsAsync(request.Name, request.Number))
				return Unsuccessful(Errors.RegisterAlreadyExists);

			serviceLocation.Update(request.Name, request.Number);

			_repository.Update(serviceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<(Result result, ServiceLocationView data)> GetByIdAsync(Guid id)
		{
			var serviceLocation = await _repository.GetByIdAsync(id);
			if (serviceLocation == null)
				return Unsuccessful<ServiceLocationView>(Errors.NotFound);

			return Successful(serviceLocation);
		}

		public async Task<(Result result, List<ServiceLocationSummary> data)> GetListAsync()
		{
			var list = await _queries.GetAllAsync();
			return Successful(list);
		}

		public async Task<(Result result, IPasswordView data)> ServiceLocationReadyAsync(Guid serviceLocationId, ServiceLocationReadyRequest request)
		{
			var serviceLocation = await _repository.GetByIdAsync(serviceLocationId);
			if (serviceLocation == null)
				return Unsuccessful<IPasswordView>(Errors.NotFound);

			var response = await _passwordIntegrationService.ServiceLocationWaitingPasswordAsync(request.QueueId, serviceLocationId, request.Name);
			if(!response.result.Success)
				return Unsuccessful<IPasswordView>(response.result.GetNotifications());

			return Successful(response.data);
        }

		public async Task<Result> RecallCurrentPasswordAsync(Guid serviceLocationId)
		{
			var currentPassword = await _passwordRepository.GetCurrentPasswordForServiceLocationAsync(serviceLocationId);
			if (currentPassword == null)
				return Unsuccessful(Errors.PasswordNotFound.ToString());

			await _mediator.Publish(new PasswordRecalledEvent(
				serviceLocationId, 
				currentPassword.Code, 
				currentPassword.ServiceLocation?.Name ?? string.Empty));

			return Successful();
		}
    }
}
