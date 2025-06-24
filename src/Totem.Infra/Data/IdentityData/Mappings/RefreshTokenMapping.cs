using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Totem.Domain.Aggregates.RefreshTokenAggregate;

namespace Totem.Infra.Data.IdentityData.Mappings
{
	public class RefreshTokenMapping : IEntityTypeConfiguration<RefreshToken>
	{
		public void Configure(EntityTypeBuilder<RefreshToken> builder)
		{
			builder.ToTable("RefreshTokens");
			builder.HasKey(x => x.Id);
			builder.Property(x => x.Token).IsRequired().HasMaxLength(36);
			builder.HasIndex(x => x.Token).IsUnique();
			builder.HasIndex(x => x.UserId);
			builder.Property(x => x.CreatedAt).IsRequired();
			builder.Property(x => x.ExpiryDate).IsRequired();
			builder.Property(x => x.Revoked).IsRequired();
			builder.Property(x => x.ReplacedByToken).HasMaxLength(36);
		}
	}
}
