using FluentValidation;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocationValidator : AbstractValidator<ServiceLocation>
	{
		public ServiceLocationValidator()
		{
			RuleFor(x => x.Name)
				.NotEmpty()
				.NotNull();

			RuleFor(x => x.Number)
				.NotEmpty()
				.NotNull();
		}

	}
}
