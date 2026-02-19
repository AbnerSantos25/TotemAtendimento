using FluentValidation;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.ServiceTypeAggregate;
using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.Application.Services.ServiceTypeServices
{
	public class ServiceTypeService : BaseService, IServiceTypeService
	{
		private readonly IServiceTypeQueires _queries;
		private readonly IServiceTypeRepository _repository;

		public ServiceTypeService(INotificator notificator, IServiceTypeQueires serviceTypeQueires, IServiceTypeRepository serviceTypeRepository) : base(notificator)
		{
			_queries = serviceTypeQueires;
			_repository = serviceTypeRepository;
		}

		public async Task<(Result result, Guid data)> CreateAsync(ServiceTypeRequest request)
		{
			ServiceTypeValidator validator = new();
			var serviceType = new ServiceType(request.Title, request.Icon, request.Color, request.TicketPrefix, request.TargetQueueId);

			if (!validator.Validate(serviceType).IsValid)
				return Unsuccessful<Guid>();

			_repository.Add(serviceType);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful<Guid>(Errors.ErrorSavingDatabase);

			return Successful(serviceType.Id);
		}

		public async Task<Result> DisableAsync(Guid id)
		{
			var serviceType = await _repository.GetByIdAsync(id);
			if(serviceType is null)
				return Unsuccessful(Errors.ServiceTypeNotFound);

			serviceType.ToggleStatus();

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<(Result result, List<ServiceTypeSummary> data)> GetActiveServicesAsync()
		{
			var serviceTypes = await _queries.GetActiveServicesAsync();
			return Successful(serviceTypes);
		}

		public async Task<(Result result, List<ServiceTypeSummary> data)> GetAllAsync()
		{
			var serviceTypes = await _queries.GetListAsync();
			return Successful(serviceTypes);
		}

		public async Task<(Result result, ServiceTypeView data)> GetByIdAsync(Guid id)
		{
			var serviceType = await _queries.GetByIdAsync(id);
			if (serviceType is null)
				return Unsuccessful<ServiceTypeView>(Errors.ServiceTypeNotFound);

			return Successful(serviceType);
		}

		public async Task<Result> ToggleStatusAsync(Guid id)
		{
			var serviceType = await _repository.GetByIdAsync(id);
			if (serviceType is null)
				return Unsuccessful(Errors.ServiceTypeNotFound);

			serviceType.ToggleStatus();

			return Successful();
		}

		public async Task<Result> UpdateAsync(Guid id, ServiceTypeRequest request)
		{
			var serviceType = await _repository.GetByIdAsync(id);
			if(serviceType is null)
				return Unsuccessful(Errors.ServiceTypeNotFound);

			serviceType.Update(request.Title, request.Icon, request.Color, request.TargetQueueId);

			ServiceTypeValidator validator = new();
			var validationResult = validator.Validate(serviceType);

			if (!validationResult.IsValid)
			{
				Notify(validationResult);
				return Unsuccessful();
			}
			
			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}
	}
}
