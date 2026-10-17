using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Totem.Application.Services.QueueServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Domain.Models.QueueModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class QueueController : MainController
    {
        private readonly IQueueServices _queueServices;
        public QueueController(INotificator notificator, IQueueServices queueServices) : base(notificator)
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
		[Authorize(Roles = $"{nameof(Role.Manager)}, {nameof(Role.System)}, {nameof(Role.User)}")]
		public async Task<IActionResult> GetListAsync()
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var hasFullAccess = User.IsInRole(nameof(Role.Admin)) || User.IsInRole(nameof(Role.Manager)) || User.IsInRole(nameof(Role.System));

            return CustomResponse(await _queueServices.GetListByPermissionAsync(userId, hasFullAccess));
        }

        [Authorize(Roles = $"{nameof(Role.Manager)}")]
        [HttpPost]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> AddAsync([FromBody] QueueRequest request)
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            return CustomResponse(await _queueServices.AddAsync(request));
        }

		[Authorize(Roles = $"{nameof(Role.Manager)}")]
		[HttpPut("{id}")]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> UpdateAsync([FromRoute] Guid id, [FromBody] QueueRequest request)
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            return CustomResponse(await _queueServices.UpdateAsync(id, request));
        }

		[Authorize(Roles = $"{nameof(Role.Manager)}")]
		[HttpDelete("{id}")]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> DeleteAsync([FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            return CustomResponse(await _queueServices.DeleteAsync(id));
        }

		[Authorize(Roles = $"{nameof(Role.Manager)}")]
		[HttpPatch("{id}/toggleQueueStatus")]
        [EnableRateLimiting("Mutation")]
        public async Task<IActionResult> ToggleStatusQueue([FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            return CustomResponse(await _queueServices.ToggleStatusQueue(id));

        }
    }
}
