using System.ComponentModel.DataAnnotations.Schema;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class Password : Entity, IAggregateRoot
	{
		public int Code { get; private set; }
		public DateTime CreatedAt { get; private set; }
		public DateTime? AssignedAt { get; private set; }
		public bool Served { get; private set; }
		public bool Preferential { get; private set; }
		public Guid? ServiceLocationId { get; private set; }
		public ServiceLocation? ServiceLocation { get; private set; }
		[NotMapped]
		public bool CanBeReassigned => !Served;


		//Propriedade EF Core - Relação
		public Guid QueueId { get; private set; }  // Chave estrangeira
		public Queue Queue { get; private set; }  // Propriedade de navegação


		protected Password() { }

		public Password(Guid queueId, bool preferential)
		{
			QueueId = queueId;
			Preferential = preferential;
			CreatedAt = DateTime.Now;
			Served = false;
		}

		public void AssignToServiceLocation(Guid serviceLocationId)
		{
			EnsureNotServed();
			this.ServiceLocationId = serviceLocationId;
			this.AssignedAt = DateTime.UtcNow;

		}

		public void AssignToQueue(Guid queueId)
		{
			EnsureNotServed();
			QueueId = queueId;
			ServiceLocationId = null;
			AssignedAt = DateTime.UtcNow;

		}
		private void EnsureNotServed()
		{
			if (!CanBeReassigned)
				throw new InvalidOperationException("Não é possível transferir uma senha já atendida.");
		}

		public void MarkAsServed() => Served = true;

		public void IncrementCode(int code)
		{
			Code = code;
		}
	}
}
