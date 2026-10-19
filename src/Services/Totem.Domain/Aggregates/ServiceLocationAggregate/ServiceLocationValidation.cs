using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Aggregates.ServiceLocationAggregate
{
	public class ServiceLocationValidation(ServiceLocation serviceLocation)
	{
		public bool AllowedAdd(string name, int? number)
		{
			serviceLocation.Requires()
				.IsValid(ServiceLocationConstructorValidation.AllowedAdd(name, number))
				.Apply();
			return serviceLocation.IsValid;
		}

		public bool AllowedUpdate(string name, int? number) => AllowedAdd(name, number);
	}

	public static class ServiceLocationConstructorValidation
	{
		public static Contract AllowedAdd(string name, int? number) =>
			new Contract().Requires()
				.HasLengthBetween(name, ServiceLocation.NameMinLength, ServiceLocation.NameMaxLength, Errors.LengthBetweenField)
					.AddLabelArgument(Labels.LocationNameLabel)
					.AddArguments(ServiceLocation.NameMinLength, ServiceLocation.NameMaxLength)
				.Apply();
	}
}
