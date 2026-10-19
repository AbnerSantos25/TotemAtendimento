using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocation : Entity, IAggregateRoot
	{
		public const int NameMinLength = 3;
		public const int NameMaxLength = 100;

		private List<Queue> _queues = new();

		public string Name { get; private set; }
		public int? Number { get; private set; }
        public IReadOnlyCollection<Queue> Queues => _queues.AsReadOnly();

		private ServiceLocationValidation? _validations;
		[NotMapped, JsonIgnore]
		public ServiceLocationValidation Validations => _validations ??= new(this);

		protected ServiceLocation() {}

        public ServiceLocation(string name, int? number = null)
		{
			if (!Validations.AllowedAdd(name, number))
				throw new DomainException(Errors.UnableCreateServiceLocation);

			Name = name;
			Number = number;
		}

		public void Update(string name, int? number)
		{
			if (!IsValid || !Validations.AllowedUpdate(name, number))
				throw new DomainException(Errors.UnableUpdateServiceLocation);

			Name = name;
			Number = number;
		}
    }

}
