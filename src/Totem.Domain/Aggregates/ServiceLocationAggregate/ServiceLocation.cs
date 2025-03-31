using Microsoft.AspNetCore.Mvc;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocation : Entity, IAggregateRoot
	{
		public string Name { get; private set; }
		public int? Number { get; private set; }

		public ServiceLocation(string name, int? number = null)
		{
			if (string.IsNullOrWhiteSpace(name))
				throw new ArgumentException($"{Messages.UnableCreateServiceLocation}", nameof(name));

			Name = name;
			Number = number;
		}
	}

}
