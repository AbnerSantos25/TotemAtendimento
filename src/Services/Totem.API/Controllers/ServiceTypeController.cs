using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.ServiceTypeServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Domain.Models.ServiceTypeModels;

namespace Totem.API.Controllers
{
	[Route("api/totem/[controller]")]
	public class ServiceTypeController : MainController
	{
		private readonly IServiceTypeService _serviceTypeService;

		public ServiceTypeController(INotificator notificator, IServiceTypeService serviceTypeService) : base(notificator)
		{
			_serviceTypeService = serviceTypeService;
		}

		[HttpGet]
		public async Task<ActionResult> GetAll()
		{
			return CustomResponse(await _serviceTypeService.GetAllAsync());
		}

		[HttpGet("active")]
		public async Task<ActionResult> GetActiveServices()
		{
			return CustomResponse(await _serviceTypeService.GetActiveServicesAsync());
		}

		[HttpGet("{id:guid}")]
		public async Task<ActionResult> GetById([FromRoute] Guid id)
		{
			return CustomResponse(await _serviceTypeService.GetByIdAsync(id));
		}

		[HttpPost]
		public async Task<ActionResult> Create([FromBody] ServiceTypeRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _serviceTypeService.CreateAsync(request));
		}

		[HttpPut("{id:guid}")]
		public async Task<ActionResult> Update([FromRoute] Guid id, [FromBody] ServiceTypeRequest request)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _serviceTypeService.UpdateAsync(id, request));
		}

		[HttpPatch("{id:guid}/toggle-status")]
		public async Task<ActionResult> ToggleStatus([FromRoute] Guid id)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _serviceTypeService.ToggleStatusAsync(id));
		}

		[HttpPatch("{id:guid}/disable")]
		public async Task<ActionResult> Disable([FromRoute] Guid id)
		{
			if (!ModelState.IsValid) return CustomResponse(ModelState);

			return CustomResponse(await _serviceTypeService.DisableAsync(id));
		}
	}
}