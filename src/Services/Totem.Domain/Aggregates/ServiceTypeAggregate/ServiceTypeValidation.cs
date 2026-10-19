using Totem.Common.Localization.Resources;
using Totem.Common.Validation;
using Totem.Common.ValueObject;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public class ServiceTypeValidation(ServiceType serviceType)
	{
		public bool AllowedAdd(string title, string? icon, string? color, string? ticketPrefix, Guid targetQueueId)
		{
			serviceType.Requires()
				.IsValid(ServiceTypeConstructorValidation.AllowedAdd(title, icon, color, ticketPrefix, targetQueueId))
				.Apply();
			return serviceType.IsValid;
		}

		public bool AllowedUpdate(string title, string? icon, string? color, string? ticketPrefix, Guid targetQueueId) =>
			AllowedAdd(title, icon, color, ticketPrefix, targetQueueId);
	}

	public static class ServiceTypeConstructorValidation
	{
		public static Contract AllowedAdd(string title, string? icon, string? color, string? ticketPrefix, Guid targetQueueId) =>
			new Contract().Requires()
				.IsNotNullOrEmpty(title, Errors.RequiredField)
					.AddLabelArgument(Labels.Title)
				.HasMaxLength(title, ServiceType.TitleMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.Title).AddArguments(ServiceType.TitleMaxLength)
				.HasMaxLength(icon, ServiceType.IconMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.Icon).AddArguments(ServiceType.IconMaxLength)
				.HasMaxLength(ticketPrefix, ServiceType.TicketPrefixMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.TicketPrefix).AddArguments(ServiceType.TicketPrefixMaxLength)
				.IsNotEmpty(targetQueueId, Errors.RequiredField)
					.AddLabelArgument(Labels.TargetQueueId)
				.When(color is not null, c => c.IsTrue(HexColor.IsValid(color), Errors.InvalidColor))
				.Apply();
	}
}
