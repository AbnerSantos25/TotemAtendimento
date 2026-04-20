using FluentValidation;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public class ServiceTypeValidator : AbstractValidator<ServiceType>
	{
		public ServiceTypeValidator()
		{
			RuleFor(x => x.Title)
				.NotEmpty()
				.MaximumLength(100);

			RuleFor(x => x.Icon)
				.MaximumLength(50);

			RuleFor(x => x.TicketPrefix)
				.MaximumLength(3);

			RuleFor(x => x.TargetQueueId)
				.NotEmpty();
		}
	}
}
