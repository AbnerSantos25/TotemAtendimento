using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
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
		public ServiceLocation ServiceLocation { get; private set; }
		[NotMapped]
		public bool CanBeReassigned => !Served;


		public Guid QueueId { get; private set; }
		public Queue Queue { get; private set; }

		private PasswordValidation? _validations;
		[NotMapped, JsonIgnore]
		public PasswordValidation Validations => _validations ??= new(this);


		protected Password() { }

		public Password(Guid queueId, bool preferential)
		{
			if (!Validations.AllowedAdd(queueId))
				throw new DomainException(Errors.UnableCreatePassword);

			QueueId = queueId;
			Preferential = preferential;
			CreatedAt = DateTime.UtcNow;
			Served = false;
		}

		public void AssignToServiceLocation(Guid serviceLocationId)
		{
			if (!IsValid || !Validations.AllowedAssignToServiceLocation(serviceLocationId))
				throw new DomainException(Errors.UnableCallPassword);

			this.ServiceLocationId = serviceLocationId;
			this.AssignedAt = DateTime.UtcNow;

		}

		public void AssignToQueue(Guid queueId)
		{
			if (!IsValid || !Validations.AllowedTransfer(queueId))
				throw new DomainException(Errors.UnableTransferPassword);

			QueueId = queueId;
			ServiceLocationId = null;
			AssignedAt = DateTime.UtcNow;

		}

		public void MarkAsServed()
		{
			if (!IsValid || !Validations.AllowedMarkAsServed())
				throw new DomainException(Errors.UnableServePassword);

			Served = true;
		}

		public void IncrementCode(int code)
		{
			Code = code;
		}
	}
}
