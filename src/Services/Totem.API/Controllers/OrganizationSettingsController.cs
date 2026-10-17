using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Totem.Application.Services.OrganizationSettingsServices;
using Totem.Common.API.Controller;
using Totem.Common.Domain.Notification;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.API.Controllers
{
    [Route("api/totem/[controller]")]
    public class OrganizationSettingsController : MainController
    {
        // Folga sobre o limite de 1 MB da logo para caber os demais campos do multipart.
        private const int MaxRequestBytes = 2 * 1024 * 1024;

        private readonly IOrganizationSettingsService _organizationSettingsService;

        public OrganizationSettingsController(INotificator notificator, IOrganizationSettingsService organizationSettingsService) : base(notificator)
        {
            _organizationSettingsService = organizationSettingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            return CustomResponse(await _organizationSettingsService.GetAsync());
        }

        [HttpPut]
		[Authorize(Roles = nameof(Role.Manager))]
		[EnableRateLimiting("Mutation")]
        [RequestSizeLimit(MaxRequestBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestBytes)]
        public async Task<IActionResult> UpdateAsync([FromForm] OrganizationSettingsRequest request, IFormFile? logo)
        {
            if (!ModelState.IsValid)
                return CustomResponse(ModelState);

            byte[]? logoBytes = null;
            if (logo is not null)
            {
                // Recusa antes de ler: o service tambem valida, mas assim nao carregamos o excesso na memoria.
                if (logo.Length > OrganizationSettingsService.LogoMaxBytes)
                {
                    NotifyError(Errors.LogoTooLarge);
                    return CustomResponse(ModelState);
                }

                using var stream = new MemoryStream();
                await logo.CopyToAsync(stream);
                logoBytes = stream.ToArray();
            }

            return CustomResponse(await _organizationSettingsService.UpdateAsync(request, logoBytes));
        }

        [AllowAnonymous]
        [HttpGet("logo")]
        public async Task<IActionResult> GetLogoAsync()
        {
            var (result, logo) = await _organizationSettingsService.GetLogoAsync();

            if (!result.Success)
                return NotFound();

            // A URL muda a cada alteracao (?v=), entao a imagem pode ficar em cache indefinidamente.
            Response.Headers.CacheControl = "public, max-age=31536000, immutable";
            Response.Headers.XContentTypeOptions = "nosniff";
            // Um SVG aberto direto no navegador nao pode executar script na origem da API.
            Response.Headers.ContentSecurityPolicy = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

            return File(logo.Content, logo.ContentType);
        }
    }
}
