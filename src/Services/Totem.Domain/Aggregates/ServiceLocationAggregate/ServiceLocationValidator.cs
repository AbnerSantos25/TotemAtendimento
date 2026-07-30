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

			RuleFor(x => x.Name)
				.Length(3, 100)
				.WithMessage("O campo {PropertyName} deve ter entre {MinLength} e {MaxLength} caracteres.");
		}
	}
}
