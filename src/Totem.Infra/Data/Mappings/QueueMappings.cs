using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class QueueMappings : IEntityTypeConfiguration<Queue>
	{
		public void Configure(EntityTypeBuilder<Queue> builder)
		{

		}
	}
}
