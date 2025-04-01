using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Infra.Mappings
{
    public class PasswordMappings : IEntityTypeConfiguration<Password>
    {
        public void Configure(EntityTypeBuilder<Password> builder)
        {
            builder.ToTable("Password");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Code).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.Served);
            builder.Property(x => x.ServiceLocationId);
            builder.Property(x => x.QueueId).IsRequired();

            builder.HasIndex(x => x.Code);
        }
    }
}
