using FluentValidation;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class Password : Entity
	{
		public string Code { get; private set; }
		public DateTime CreatedAt { get; private set; }
		public bool Served { get; private set; }
		public Guid ServiceLocationId { get; private set; }
		public ServiceLocation ServiceLocation { get; private set; }

		protected Password() { }

		public Password(string code)
		{
			Code = code;
			CreatedAt = DateTime.Now;
			Served = false;
		}

		public void AssignServiceLocation(Guid serviceLocationId)
		{
			ServiceLocationId = serviceLocationId;
		}

		public void MarkAsServed() => Served = true;

		
	}
}
