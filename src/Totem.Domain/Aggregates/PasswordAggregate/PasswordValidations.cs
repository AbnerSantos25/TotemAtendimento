using FluentValidation;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class PasswordValidations : AbstractValidator<Password>
	{
		public PasswordValidations()
		{
			RuleFor(x => x.Code).NotEmpty().MaximumLength(10);
            RuleFor(x => x.QueueId).NotEmpty();
            RuleFor(x => x.Preferential).NotNull();
        }
	}
}
