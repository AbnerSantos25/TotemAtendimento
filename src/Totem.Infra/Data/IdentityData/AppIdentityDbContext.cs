using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.RefreshTokenAggregate;
using Totem.Infra.Data.IdentityData.Mappings;

namespace Totem.Infra.Data.IdentityData
{
    public class AppIdentityDbContext : IdentityDbContext, IUnitOfWork
	{
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options)
        {
        }

		public DbSet<RefreshToken> RefreshTokens { get; set; }

		public virtual async Task<bool> CommitAsync()
		{
			using var transaction = await Database.BeginTransactionAsync();

			try
			{
				var result = await SaveChangesAsync() > 0;

				// Se a operação foi bem-sucedida, commit da transação
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
				await transaction.RollbackAsync(); // Em caso de erro, realiza o rollback
				Console.WriteLine($"Erro ao realizar commit: {ex.Message}");
				return false;
			}
		}


		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.HasDefaultSchema("Identity");

			modelBuilder.ApplyConfiguration(new RefreshTokenMapping());
		}
	}
}
