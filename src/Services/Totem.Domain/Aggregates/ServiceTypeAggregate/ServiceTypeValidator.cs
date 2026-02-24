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

			RuleFor(x => x.Color)
				.NotEmpty();

			RuleFor(x => x.Color.Value)
				.NotEmpty().MaximumLength(7);

			RuleFor(x => x.TicketPrefix)
				.NotEmpty()
				.MaximumLength(3);

			RuleFor(x => x.TargetQueueId)
				.NotEmpty();
		}
	}
}
