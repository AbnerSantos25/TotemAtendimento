using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Common.ValueObject;
using Totem.Domain.Aggregates.OrganizationSettingsAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class OrganizationSettingsMappings : IEntityTypeConfiguration<OrganizationSettings>
	{
		public void Configure(EntityTypeBuilder<OrganizationSettings> builder)
		{
			builder.Property(x => x.Name).HasMaxLength(OrganizationSettings.NameMaxLength).IsRequired();

			builder.Property(x => x.Cnpj)
					.HasConversion(
							cnpj => cnpj.Value,
							stringValue => new Cnpj(stringValue)
					)
					.HasColumnType("char(14)")
					.IsRequired();

			builder.Property(x => x.WebsiteUrl).HasMaxLength(OrganizationSettings.WebsiteMaxLength).HasColumnType("varchar(255)").IsRequired();
			builder.Property(x => x.Logo).HasColumnType("varbinary(max)").IsRequired(false);
			builder.Property(x => x.LogoContentType).HasMaxLength(50).HasColumnType("varchar(50)").IsRequired(false);
		}
	}
}
