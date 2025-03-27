using Totem.Common.Domain.Entity;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocation : Entity
	{
		public string Name { get; private set; }
		public int? Number { get; private set; }
	
		public ServiceLocation(string name, int? number = null)
		{
			if (string.IsNullOrWhiteSpace(name))
				//TODO: Implement Resource files (.resx)
				throw new ArgumentException($"Não foi possível criar o Local de Atendimento", nameof(name)); 
			
			Name = name;
			Number = number;
		}
	}

}
