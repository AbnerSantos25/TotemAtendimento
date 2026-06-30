using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.UserAggregate;

namespace Totem.Infra.Data.IdentityData.Mappings
{
	public class UserQueuePermissionMapping : IEntityTypeConfiguration<UserQueuePermission>
	{
		public void Configure(EntityTypeBuilder<UserQueuePermission> builder)
		{
			builder.ToTable("SysUserQueuePermissions");

			// Composite PK — no FK constraints (cross-schema logical reference)
			builder.HasKey(x => new { x.UserId, x.QueueId });

			builder.Property(x => x.UserId).IsRequired();
			builder.Property(x => x.QueueId).IsRequired();

			// Index for fast lookup of allowed queues by user
			builder.HasIndex(x => x.UserId);
		}
	}
}
