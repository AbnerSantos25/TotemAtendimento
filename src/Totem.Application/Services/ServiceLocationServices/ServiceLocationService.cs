using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Application.Services.ServiceLocationServices
{
	public class ServiceLocationService : BaseService, IServiceLocationService
	{
		private readonly IServiceLocationRepository _repository;
		private readonly IServiceLocationQueries _queries;

		public ServiceLocationService(INotificador notificador, IServiceLocationRepository repository, IServiceLocationQueries queries) : base(notificador)
		{
			_repository = repository;
			_queries = queries;
		}

		public async Task<Result> AddAsync(ServiceLocationRequest request)
		{
			ServiceLocationValidator validator = new();
			var ServiceLocation = new ServiceLocation(request.Name, request.Number);

			if (!validator.Validate(ServiceLocation).IsValid)
				return Unsuccessful();

			if (await _repository.ExistsAsync(request.Name, request.Number))
				return Unsuccessful(Errors.RegisterAlreadyExists);

			_repository.Add(ServiceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<Result> DeleteAsync(Guid Id)
		{
			var serviceLocation = _repository.GetByIdAsync(Id);

			if (serviceLocation == null)
				return Unsuccessful(Errors.NotFound);

			_repository.Delete(serviceLocation.Result);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful(Errors.ErrorSavingDatabase);

			return Successful();
		}

		public async Task<Result> UpdateAsync(Guid Id, ServiceLocationRequest request)
		{
			ServiceLocationValidator validator = new();
			var ServiceLocationValidator = new ServiceLocation(request.Name, request.Number);

			if (await _repository.ExistsAsync(request.Name, request.Number))
			{
				Notificar(Errors.RegisterAlreadyExists);
				return Unsuccessful();
			}

			if (!validator.Validate(ServiceLocationValidator).IsValid)
				return Unsuccessful();

			var serviceLocation = _repository.GetByIdAsync(Id).Result;
			if (serviceLocation == null)
				return Unsuccessful();

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

	}
}
