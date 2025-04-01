using FluentValidation;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class PasswordValidations : AbstractValidator<Password>
	{
		public PasswordValidations()
		{
            RuleFor(x => x.QueueId).NotEmpty();
        }
	}
}
