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
			builder.Property(x => x.PasswordId).IsRequired();
			builder.Property(x => x.Timestamp).IsRequired();
			builder.Property(x => x.Action).IsRequired().HasMaxLength(50);
			builder.Property(x => x.Description).IsRequired().HasMaxLength(200);
			builder.HasIndex(x => x.PasswordId);

		}
	}
}