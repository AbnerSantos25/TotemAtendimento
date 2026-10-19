using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
	public class PasswordValidation(Password password)
	{
		public bool AllowedAdd(Guid queueId)
		{
			password.Requires()
				.IsValid(PasswordConstructorValidation.AllowedAdd(queueId))
				.Apply();
			return password.IsValid;
		}

		public bool AllowedTransfer(Guid newQueueId)
		{
			password.Requires()
				.IsTrue(password.CanBeReassigned, Errors.PasswordCannotBeTransfered)
				.IsNotEmpty(newQueueId, Errors.RequiredField)
					.AddLabelArgument(Labels.Queue)
				.Apply();
			return password.IsValid;
		}

		public bool AllowedAssignToServiceLocation(Guid serviceLocationId)
		{
			password.Requires()
				.IsTrue(password.CanBeReassigned, Errors.PasswordCannotBeTransfered)
				.IsNotEmpty(serviceLocationId, Errors.RequiredField)
					.AddLabelArgument(Labels.ServiceLocator)
				.Apply();
			return password.IsValid;
		}

		public bool AllowedMarkAsServed()
		{
			password.Requires()
				.IsFalse(password.Served, Errors.PasswordAlreadyServed)
					.StopOnFailure()
				.IsTrue(password.ServiceLocationId != null, Errors.PasswordCannotBeServed)
				.Apply();
			return password.IsValid;
		}
	}

	public static class PasswordConstructorValidation
	{
		public static Contract AllowedAdd(Guid queueId) =>
			new Contract().Requires()
				.IsNotEmpty(queueId, Errors.RequiredField)
					.AddLabelArgument(Labels.Queue)
				.Apply();
	}
}
