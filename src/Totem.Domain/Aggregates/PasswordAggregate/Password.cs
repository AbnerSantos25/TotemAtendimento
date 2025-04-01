using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class Password : Entity, IAggregateRoot
	{
		public string Code { get; private set; }
		public DateTime CreatedAt { get; private set; }
		public bool Served { get; private set; }
		public Guid ServiceLocationId { get; private set; }
		public ServiceLocation ServiceLocation { get; private set; }
		public bool Preferential { get; private set; } // Pde78

        //Propriedade EF Core - Relação
        public Guid QueueId { get; private set; }  // Chave estrangeira
        public Queue Queue { get; private set; }  // Propriedade de navegação


        protected Password() { }

		public Password(string code, Guid queueId, bool preferential) // P9088
		{
			Code = code;
            QueueId = queueId;
            CreatedAt = DateTime.Now;
			Served = false;
			Preferential = preferential; // P9088
		}

		public void AssignServiceLocation(Guid serviceLocationId)
		{
			ServiceLocationId = serviceLocationId;
		}

		public void MarkAsServed() => Served = true;

		
	}
}
