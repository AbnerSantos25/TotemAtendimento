using System.Text;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Common.ValueObject;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;
using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.Application.Services.OrganizationSettingsServices
{
	public class OrganizationSettingsService : BaseService, IOrganizationSettingsService
	{
		public const int LogoMaxBytes = 1024 * 1024;

		private readonly IOrganizationSettingsRepository _repository;
		private readonly IOrganizationSettingsQueries _queries;

		public OrganizationSettingsService(
			INotificator notificator,
			IOrganizationSettingsRepository repository,
			IOrganizationSettingsQueries queries
		) : base(notificator)
		{
			_repository = repository;
			_queries = queries;
		}

		public async Task<(Result result, OrganizationSettingsView? data)> GetAsync()
		{
			return Successful(await _queries.GetAsync());
		}

		public async Task<(Result result, OrganizationLogo data)> GetLogoAsync()
		{
			var logo = await _queries.GetLogoAsync();

			if (logo is null)
				return Unsuccessful<OrganizationLogo>(Errors.NotFound);

			return Successful(logo);
		}

		public async Task<(Result result, OrganizationSettingsView data)> UpdateAsync(OrganizationSettingsRequest request, byte[]? logo)
		{
			if (!Cnpj.IsValid(request.Cnpj))
				return Unsuccessful<OrganizationSettingsView>(Errors.InvalidCnpj);

			string? logoContentType = null;

			if (logo is not null)
			{
				if (logo.Length > LogoMaxBytes)
					return Unsuccessful<OrganizationSettingsView>(Errors.LogoTooLarge);

				logoContentType = DetectImageContentType(logo);

				if (logoContentType is null)
					return Unsuccessful<OrganizationSettingsView>(Errors.InvalidLogoFormat);
			}

			var cnpj = new Cnpj(request.Cnpj);
			//TODO: (abner) Alterar para que toda string que entrar na api passar por uma sanitização, para evitar problemas de segurança e inconsistência de dados.
			var name = request.Name.Trim();
			var website = NormalizeWebsite(request.WebsiteUrl);

			var settings = await _repository.GetAsync();
			var isNew = settings is null;

			if (isNew)
				settings = new OrganizationSettings(name, cnpj, website);
			else
				settings.Update(name, cnpj, website);

			if (logo is not null)
				settings.SetLogo(logo, logoContentType!);
			else if (request.RemoveLogo)
				settings.RemoveLogo();

			if (!ExecuteValidation(new OrganizationSettingsValidator(), settings))
				return Unsuccessful<OrganizationSettingsView>();

			if (isNew)
				_repository.Add(settings);
			else
				_repository.Update(settings);

			if (!await _repository.UnitOfWork.CommitAsync())
				return Unsuccessful<OrganizationSettingsView>(Errors.ErrorSavingDatabase);

			return Successful(new OrganizationSettingsView
			{
				Name = settings.Name,
				Cnpj = settings.Cnpj.Value,
				WebsiteUrl = settings.WebsiteUrl,
				LogoUrl = settings.Logo is null ? null : OrganizationSettingsView.BuildLogoUrl(settings.UpdatedAt)
			});
		}

		// Remove protocolo e barra final: o painel exibe so o dominio.
		private static string NormalizeWebsite(string value)
		{
			var website = value.Trim();
			foreach (var protocol in new[] { "https://", "http://" })
			{
				if (website.StartsWith(protocol, StringComparison.OrdinalIgnoreCase))
					website = website[protocol.Length..];
			}
			return website.TrimEnd('/');
		}

		// O tipo vem da assinatura do arquivo, nunca do Content-Type informado pelo cliente.
		private static string? DetectImageContentType(byte[] bytes)
		{
			if (StartsWith(bytes, 0x89, 0x50, 0x4E, 0x47)) return "image/png";
			if (StartsWith(bytes, 0xFF, 0xD8, 0xFF)) return "image/jpeg";
			if (bytes.Length >= 12 && Encoding.ASCII.GetString(bytes, 0, 4) == "RIFF" && Encoding.ASCII.GetString(bytes, 8, 4) == "WEBP")
				return "image/webp";

			// SVG e texto: basta o elemento raiz aparecer no inicio do arquivo (depois de prolog/comentarios).
			var head = Encoding.UTF8.GetString(bytes, 0, Math.Min(bytes.Length, 1024));
			if (head.Contains("<svg", StringComparison.OrdinalIgnoreCase)) return "image/svg+xml";

			return null;
		}

		private static bool StartsWith(byte[] bytes, params byte[] signature) =>
			bytes.Length >= signature.Length && bytes.AsSpan(0, signature.Length).SequenceEqual(signature);
	}
}
