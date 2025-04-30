using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class PasswordHistoryMappings : IEntityTypeConfiguration<PasswordHistory>
	{
		public void Configure(EntityTypeBuilder<PasswordHistory> builder)
		{
			builder.ToTable("PasswordHistory");
			builder.Property(x => x.Id).IsRequired();
			builder.HasIndex(x => x.PasswordId);

		}
	}
}
