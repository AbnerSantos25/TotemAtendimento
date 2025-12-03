using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.UserAggregate;

namespace Totem.Infra.Data.IdentityData.Mappings
{
	public class SysUserMappings : IEntityTypeConfiguration<User>
	{
		public void Configure(EntityTypeBuilder<User> builder)
		{
			builder.Property(u => u.FullName)
				.HasMaxLength(200)
				.IsRequired()
				.HasColumnType("varchar(200)");
		}
	}
}
