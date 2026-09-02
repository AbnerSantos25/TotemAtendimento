namespace Totem.Application.Services.PasswordMatchingServices
{
	/// <inheritdoc cref="IWaitingServiceLocationStore"/>
	public sealed class WaitingServiceLocationStore : IWaitingServiceLocationStore
	{
		private readonly Dictionary<Guid, List<Guid>> _waitingByQueue = new();
		private readonly object _gate = new();

		public void Enqueue(Guid queueId, Guid serviceLocationId)
		{
			lock (_gate)
			{
				if (!_waitingByQueue.TryGetValue(queueId, out var waiting))
				{
					waiting = new List<Guid>();
					_waitingByQueue[queueId] = waiting;
				}

				// Um guiche que pede senha duas vezes seguidas nao deve ocupar dois lugares.
				if (!waiting.Contains(serviceLocationId))
					waiting.Add(serviceLocationId);
			}
		}

		public bool TryDequeue(Guid queueId, out Guid serviceLocationId)
		{
			lock (_gate)
			{
				if (_waitingByQueue.TryGetValue(queueId, out var waiting) && waiting.Count > 0)
				{
					serviceLocationId = waiting[0];
					waiting.RemoveAt(0);
					return true;
				}

				serviceLocationId = Guid.Empty;
				return false;
			}
		}

		public void Remove(Guid queueId, Guid serviceLocationId)
		{
			lock (_gate)
			{
				if (_waitingByQueue.TryGetValue(queueId, out var waiting))
					waiting.Remove(serviceLocationId);
			}
		}
	}
}
