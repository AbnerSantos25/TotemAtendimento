using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.ServiceTypeAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class ServiceTypeMapping : IEntityTypeConfiguration<ServiceType>
	{
		public void Configure(EntityTypeBuilder<ServiceType> builder)
		{
			builder.HasIndex(s => new { s.Title, s.TargetQueueId }).IsUnique();

			builder.HasIndex(s => s.TicketPrefix).IsUnique();

			builder.Property(s => s.Color)
				   .HasMaxLength(7);
		}
	}
}
