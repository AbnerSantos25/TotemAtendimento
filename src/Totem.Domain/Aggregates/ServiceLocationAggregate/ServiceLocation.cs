using Microsoft.AspNetCore.Mvc;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.QueueAggregate;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocation : Entity, IAggregateRoot
	{
		private List<Queue> _queues = new();

		public string Name { get; private set; }
		public int? Number { get; private set; }
        public IReadOnlyCollection<Queue> Queues => _queues.AsReadOnly();

        public ServiceLocation(string name, int? number = null)
		{
			//TODO: Abner Validar com Validator
			if (string.IsNullOrWhiteSpace(name))
				throw new ArgumentException($"{Messages.UnableCreateServiceLocation}", nameof(name));

			Name = name;
			Number = number;
		}

		public void Update(string name, int? number)
		{
			Name = name;
			Number = number;
		}

		public Guid GetQueueId (Guid queueId)
        {
            var queue = _queues.FirstOrDefault(x => x.Id == queueId);
            if (queue == null)
                throw new ArgumentException();

            return queue.Id;
        }
    }

}
