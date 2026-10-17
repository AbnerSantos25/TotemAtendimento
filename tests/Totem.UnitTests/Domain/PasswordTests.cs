using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.UnitTests.Domain
{
	public class PasswordTests
	{
		[Fact(DisplayName = "Senha já atendida não pode ser transferida de fila e os dados não podem ser alterados")]
		public void AssignToQueue_WhenPasswordIsServed_ShouldThrowAndPreserveQueue()
		{
			//Arrange
			var password = new Password(Guid.NewGuid(), preferential: true);
			var oldQueueId = password.QueueId;
			password.MarkAsServed();

			//Act + Assert
			Assert.Throws<InvalidOperationException>(() => password.AssignToQueue(Guid.NewGuid()));
			Assert.Equal(oldQueueId, password.QueueId);
		}
	}
}
