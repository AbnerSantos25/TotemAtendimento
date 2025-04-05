using Microsoft.EntityFrameworkCore;
using Totem.Common.API.Data;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Aggregates.UserAggregate;

namespace Totem.Infra.Data
{
    public class TotemDbContext : SharedDbContext
    {
        public TotemDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Password> Passwords { get; set; }
        public DbSet<Queue> Queues { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ServiceLocation> ServiceLocations { get; set; }


        protected override string GetDefaultContextSchema() => "Totem";

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(TotemDbContext).Assembly);
        }
    }
}
