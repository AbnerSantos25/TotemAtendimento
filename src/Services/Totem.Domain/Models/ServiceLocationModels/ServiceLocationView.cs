using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Domain.Models.ServiceLocationModels
{
	public class ServiceLocationView
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public int? Number { get; set; }
		
		public static implicit operator ServiceLocationView(ServiceLocation serviceLocation)
		{
			return new ServiceLocationView
			{
				Id = serviceLocation.Id,
				Name = serviceLocation.Name,
				Number = serviceLocation.Number
			};
		}
	}
}
