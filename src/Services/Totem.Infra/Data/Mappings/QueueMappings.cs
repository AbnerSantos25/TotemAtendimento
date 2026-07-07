using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class QueueMappings : IEntityTypeConfiguration<Queue>
	{
		public void Configure(EntityTypeBuilder<Queue> builder)
		{
			builder.Property(x => x.Name).HasMaxLength(100).IsRequired();

			builder.Property(x => x.IsActive)
				.HasDefaultValue(true).IsRequired();

			builder.HasMany(x => x.Passwords)
				.WithOne(p => p.Queue)
				.HasForeignKey(x => x.QueueId)
				.OnDelete(DeleteBehavior.Cascade);
		}
	}
}
