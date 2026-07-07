using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class ServiceLocationMappings : IEntityTypeConfiguration<ServiceLocation>
	{
		public void Configure(EntityTypeBuilder<ServiceLocation> builder)
		{
			builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
			builder.Property(x => x.Number).IsRequired(false);
		}
	}
}
