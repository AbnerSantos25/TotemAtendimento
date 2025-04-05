using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Domain.Models.ServiceLocationModels
{
	public class ServiceLocationSummary
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public int? Number { get; set; }
	}
}
