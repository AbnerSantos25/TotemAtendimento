using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Infra.Data.Mappings
{
	public class ServiceLocationMappings : IEntityTypeConfiguration<ServiceLocation>
	{
		public void Configure(EntityTypeBuilder<ServiceLocation> builder)
		{
			
		}
	}
}
