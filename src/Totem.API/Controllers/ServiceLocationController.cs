using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.ServiceLocationServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.API.Controllers
{
	[Route("api/totem/[controller]")]
	public class ServiceLocationController : MainController
	{
		private readonly IServiceLocationService _serviceLocationService;
		public ServiceLocationController(INotificator notificator, IServiceLocationService serviceLocationService) : base(notificator)
		{
			_serviceLocationService = serviceLocationService;
		}


		[HttpPost("{serviceLocationId}/ready")]
		public async Task<IActionResult> NotifyAvailable([FromRoute] Guid serviceLocationId, [FromBody] ServiceLocationReadyRequest request)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			var password = await _serviceLocationService.ServiceLocationReadyAsync(serviceLocationId, request);

			return CustomResponse(password);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetByIdAsync([FromRoute] Guid id)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _serviceLocationService.GetByIdAsync(id));
		}

		[HttpGet]
		public async Task<IActionResult> GetListAsync()
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			var response = await _serviceLocationService.GetListAsync();
			return CustomResponse(response);
		}

		[Authorize(Roles = "Admin, Manager")]
		[HttpPost]
		public async Task<IActionResult> AddAsync([FromBody] ServiceLocationRequest request)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _serviceLocationService.AddAsync(request));
		}

		[Authorize(Roles = "Admin, Manager")]
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateAsync([FromRoute] Guid id, [FromBody] ServiceLocationRequest request)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _serviceLocationService.UpdateAsync(id, request));
		}

		[Authorize(Roles = "Admin, Manager")]
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _serviceLocationService.DeleteAsync(id));
		}
	}
}
