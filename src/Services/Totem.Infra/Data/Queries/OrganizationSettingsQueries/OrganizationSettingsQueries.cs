using Microsoft.EntityFrameworkCore;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;
using Totem.Domain.Models.OrganizationSettingsModels;

namespace Totem.Infra.Data.Queries.OrganizationSettingsQueries
{
	public class OrganizationSettingsQueries : IOrganizationSettingsQueries
	{
		private readonly TotemDbContext _context;

		public OrganizationSettingsQueries(TotemDbContext context)
		{
			_context = context;
		}

		public async Task<OrganizationSettingsView?> GetAsync()
		{
			// Projecao sem a coluna Logo: o painel consulta isto e nao precisa trazer a imagem.
			return await _context.OrganizationSettings
							.AsNoTracking()
							.SingleOrDefaultAsync();
		}

		public async Task<OrganizationLogo?> GetLogoAsync()
		{
			var row = await _context.OrganizationSettings
							.AsNoTracking()
							.Where(x => x.Logo != null)
							.Select(x => new { x.Logo, x.LogoContentType })
							.SingleOrDefaultAsync();

			return row is null ? null : new OrganizationLogo(row.Logo!, row.LogoContentType!);
		}
	}
}
