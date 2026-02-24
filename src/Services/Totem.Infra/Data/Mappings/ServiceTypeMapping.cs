using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Common.ValueObject;
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
					.HasConversion(
							hexColor => hexColor != null ? hexColor.Value : null,
							stringValue => stringValue != null ? new HexColor(stringValue) : null
					)
				   .HasColumnName("Color")
				   .HasColumnType("varchar(7)");
		}
	}
}
