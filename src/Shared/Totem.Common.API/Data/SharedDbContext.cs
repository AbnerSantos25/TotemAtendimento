using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;

namespace Totem.Common.API.Data
{
    public abstract class SharedDbContext : DbContext, IUnitOfWork
	{
        public SharedDbContext(DbContextOptions options) : base(options)
        {

        }
        protected virtual void ApplyConfigurations(ModelBuilder modelBuilder) { }

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

            foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(
                e => e.GetProperties().Where(p => p.ClrType == typeof(string))))
                property.SetColumnType("varchar(100)");

            foreach (var foreignKey in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }

            var defaultSchema = GetDefaultContextSchema();
            if (!string.IsNullOrWhiteSpace(defaultSchema))
            {
                modelBuilder.HasDefaultSchema(defaultSchema);
            }

            this.ApplyConfigurations(modelBuilder);
        }

        protected abstract string GetDefaultContextSchema();


    }
}
