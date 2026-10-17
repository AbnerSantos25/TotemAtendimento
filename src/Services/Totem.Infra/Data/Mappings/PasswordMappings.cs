using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Infra.Data.Mappings
{
    public class PasswordMappings : IEntityTypeConfiguration<Password>
    {
        /// <summary>
        /// O SQL Server guarda datetime2 sem fuso, e o EF devolve o valor como
        /// DateTimeKind.Unspecified. Sem isso o System.Text.Json serializa a data sem
        /// o sufixo "Z" e o navegador a interpreta como horario local -- exibindo o
        /// horario UTC como se fosse local. O conversor reafirma na leitura o que o
        /// dominio ja grava: UTC.
        /// </summary>
        public static readonly ValueConverter<DateTime, DateTime> UtcConverter = new(
            toDatabase => toDatabase,
            fromDatabase => DateTime.SpecifyKind(fromDatabase, DateTimeKind.Utc));

        private static readonly ValueConverter<DateTime?, DateTime?> NullableUtcConverter = new(
            toDatabase => toDatabase,
            fromDatabase => fromDatabase.HasValue
                ? DateTime.SpecifyKind(fromDatabase.Value, DateTimeKind.Utc)
                : fromDatabase);

        public void Configure(EntityTypeBuilder<Password> builder)
        {
            builder.ToTable("Passwords");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Code).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired().HasConversion(UtcConverter);
            builder.Property(x => x.AssignedAt).HasConversion(NullableUtcConverter);
            builder.Property(x => x.Served);
            builder.Property(x => x.Preferential).IsRequired();
            builder.Property(x => x.ServiceLocationId);
            builder.Property(x => x.QueueId).IsRequired();

            builder.HasIndex(x => x.Code).IsUnique();
        }
    }
}
