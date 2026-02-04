using Microsoft.EntityFrameworkCore;
using Totem.Common.API.Data;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.ServiceTypeAggregate;
using Totem.Infra.Data.IdentityData;
using Totem.Infra.Data.Mappings;

namespace Totem.Infra.Data
{
	public class TotemDbContext : SharedDbContext
	{
		public TotemDbContext(DbContextOptions<TotemDbContext> options) : base(options)
		{

		}
		public DbSet<Password> Passwords { get; set; }
		public DbSet<Queue> Queues { get; set; }
		public DbSet<ServiceLocation> ServiceLocations { get; set; }
		public DbSet<PasswordHistory> PasswordHistories { get; set; }
		public DbSet<ServiceType> ServiceTypes { get; set; }

		protected override string GetDefaultContextSchema() => "Totem";

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.ApplyConfiguration(new PasswordMappings());
			modelBuilder.ApplyConfiguration(new PasswordHistoryMappings());
			modelBuilder.ApplyConfiguration(new QueueMappings());
			modelBuilder.ApplyConfiguration(new ServiceLocationMappings());
			modelBuilder.ApplyConfiguration(new ServiceTypeMapping());
		}
	}
}
