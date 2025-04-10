using Microsoft.AspNetCore.Mvc;
using Totem.Application.Services.QueueServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Domain.Models.QueueModels;

namespace Totem.API.Controllers
{
	[Route("api/totem/[controller]")]
	public class QueueController : MainController
	{
		private readonly IQueueServices _queueServices;
		public QueueController(INotificador notificador, IQueueServices queueServices) : base(notificador)
		{
			_queueServices = queueServices;
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetQueueById(Guid id)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.GetByIdAsync(id));
		}

		[HttpGet]
		public async Task<IActionResult> GetListAsync()
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.GetListAsync());
		}

		[HttpPost]
		public async Task<IActionResult> AddAsync([FromBody] QueueRequest request)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.AddAsync(request));
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateAsync([FromRoute] Guid id, [FromBody] QueueRequest request)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.UpdateAsync(id, request));
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.DeleteAsync(id));
		}

		[HttpPatch("{id}/toggleQueueStatus")]
		public async Task<IActionResult> ToggleStatusQueue([FromRoute] Guid id)
		{
			if (!ModelState.IsValid)
				return CustomResponse(ModelState);

			return CustomResponse(await _queueServices.ToggleStatusQueue(id));

		}
	}
}
