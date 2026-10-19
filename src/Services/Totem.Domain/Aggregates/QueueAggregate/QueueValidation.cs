using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Aggregates.QueueAggregate
{
	public class QueueValidation(Queue queue)
	{
		public bool AllowedAdd(string name)
		{
			queue.Requires()
				.IsValid(QueueConstructorValidation.AllowedAdd(name))
				.Apply();
			return queue.IsValid;
		}

		public bool AllowedUpdate(string name) => AllowedAdd(name);
	}

	public static class QueueConstructorValidation
	{
		public static Contract AllowedAdd(string name) =>
			new Contract().Requires()
				.IsNotNullOrEmpty(name, Errors.RequiredField)
					.AddLabelArgument(Labels.QueueName)
				.HasMaxLength(name, Queue.NameMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.QueueName).AddArguments(Queue.NameMaxLength)
				.Apply();
	}
}
