using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Infra.Data.IdentityData.Mappings;

namespace Totem.Infra.Data.IdentityData
{
	public class AppIdentityDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IUnitOfWork
	{
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options)
        {
        }
		private const string prefix = "Sys";
		public DbSet<RefreshToken> RefreshTokens { get; set; }

		public virtual async Task<bool> CommitAsync()
		{
			using var transaction = await Database.BeginTransactionAsync();

			try
			{
				var result = await SaveChangesAsync() > 0;

				if (result)
				{
					await transaction.CommitAsync();
				}
				else
				{
					await transaction.RollbackAsync();
				}

				return result;
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				Console.WriteLine($"Erro ao realizar commit: {ex.Message}");
				return false;
			}
		}


		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.HasDefaultSchema("Identity");

			modelBuilder.Entity<User>().ToTable($"{prefix}User");
			modelBuilder.Entity<IdentityRole<Guid>>().ToTable($"{prefix}Roles");
			modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable($"{prefix}UserClaims");
			modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable($"{prefix}RoleClaims");
			modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable($"{prefix}UserLogins");
			modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable($"{prefix}UserTokens");
			modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable($"{prefix}UserRoles");

			modelBuilder.ApplyConfiguration(new RefreshTokenMapping());
			modelBuilder.ApplyConfiguration(new SysUserMappings());
		}
	}
}
