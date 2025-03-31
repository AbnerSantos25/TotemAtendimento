using System.Runtime.CompilerServices;
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

		public ServiceLocationService(INotificador notificador, IServiceLocationRepository repository, IServiceLocationQueries queries, Errors errors) : base(notificador)
		{
			_repository = repository;
			_queries = queries;
		}

		public async Task<bool> AddAsync(ServiceLocationRequest request)
		{
			ServiceLocationValidator validator = new();
			var ServiceLocation = new ServiceLocation(request.Name, request.Number);

			if (!validator.Validate(ServiceLocation).IsValid)
				return false;

			_repository.Add(ServiceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				Notificar(Errors.ErrorSavingDatabase);

			return true;
		}

		public async Task<bool> DeleteAsync(Guid Id)
		{
			var serviceLocation = _repository.GetById(Id);
			if (serviceLocation == null)
				return false;

			_repository.Delete(serviceLocation.Result);

			if (!await _repository.UnitOfWork.CommitAsync())
				Notificar(Errors.ErrorSavingDatabase);

			return true;
		}

		public async Task<bool> UpdateAsync(ServiceLocationRequest request)
		{
			ServiceLocationValidator validator = new();
			var ServiceLocation = new ServiceLocation(request.Name, request.Number);

			if (await _repository.ExistsAsync(request.Name, request.Number))
			{
				Notificar(Errors.RegisterAlreadyExists);
				return false;
			}

			if (!validator.Validate(ServiceLocation).IsValid)
				return false;

			_repository.Update(ServiceLocation);

			if (!await _repository.UnitOfWork.CommitAsync())
				Notificar(Errors.ErrorSavingDatabase);

			return true;
		}

		public async Task<ServiceLocationView> GetByIdAsync(Guid Id)
		{
			return await _queries.GetByIdAsync(Id);
		}

		public async Task<(bool Success, List<ServiceLocationSummary> data)> GetListAsync()
		{
			try
			{
				var result = await _queries.GetAllAsync();
				return (true, result);
			}
			catch (Exception ex)
			{
				Notificar(ex.Message);
			}
			return (false, null);
		}
	}
}
