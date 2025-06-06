﻿using Totem.Common.Services;
using Totem.Domain.Models.ServiceLocationModels;
using Totem.SharedKernel.Models;

namespace Totem.Application.Services.ServiceLocationServices
{
	public interface IServiceLocationService
	{
		Task<(Result result, List<ServiceLocationSummary> data)> GetListAsync();
		Task<(Result result, ServiceLocationView data)> GetByIdAsync(Guid Id);
		Task<Result> AddAsync(ServiceLocationRequest request);
		Task<Result> UpdateAsync(Guid Id, ServiceLocationRequest request);
		Task<Result> DeleteAsync(Guid Id);

		Task<(Result result, IPasswordView data)> ServiceLocationReadyAsync(Guid serviceLocationId, ServiceLocationReadyRequest request);

	}
}
