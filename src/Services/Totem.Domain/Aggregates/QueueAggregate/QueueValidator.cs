using FluentValidation;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class QueueValidator : AbstractValidator<Queue>
	{
		public QueueValidator()
		{
			RuleFor(x => x.Name)
				.NotNull()
				.NotEmpty();
		}
	}
}
