using Totem.Application.Services.PasswordMatchingServices;

namespace Totem.UnitTests.Services;

public class WaitingServiceLocationStoreTests
{
    private readonly WaitingServiceLocationStore _sut = new();

    [Fact(DisplayName = "Atende os guiches na ordem em que entraram na espera")]
    public void TryDequeue_ShouldRespectFifoOrder()
    {
        var queueId = Guid.NewGuid();
        var first = Guid.NewGuid();
        var second = Guid.NewGuid();

        _sut.Enqueue(queueId, first);
        _sut.Enqueue(queueId, second);

        Assert.True(_sut.TryDequeue(queueId, out var dequeuedFirst));
        Assert.True(_sut.TryDequeue(queueId, out var dequeuedSecond));

        Assert.Equal(first, dequeuedFirst);
        Assert.Equal(second, dequeuedSecond);
    }

    [Fact(DisplayName = "Guiche que pede senha duas vezes ocupa um unico lugar")]
    public void Enqueue_WhenCalledTwiceForSameLocation_ShouldNotDuplicate()
    {
        var queueId = Guid.NewGuid();
        var serviceLocationId = Guid.NewGuid();

        _sut.Enqueue(queueId, serviceLocationId);
        _sut.Enqueue(queueId, serviceLocationId);

        Assert.True(_sut.TryDequeue(queueId, out _));
        Assert.False(_sut.TryDequeue(queueId, out _));
    }

    [Fact(DisplayName = "Fila sem guiche em espera nao devolve nada")]
    public void TryDequeue_WhenQueueIsEmpty_ShouldReturnFalse()
    {
        Assert.False(_sut.TryDequeue(Guid.NewGuid(), out var serviceLocationId));
        Assert.Equal(Guid.Empty, serviceLocationId);
    }

    [Fact(DisplayName = "Espera de uma fila nao vaza para outra")]
    public void TryDequeue_ShouldIsolateQueues()
    {
        var queueId = Guid.NewGuid();
        var otherQueueId = Guid.NewGuid();

        _sut.Enqueue(queueId, Guid.NewGuid());

        Assert.False(_sut.TryDequeue(otherQueueId, out _));
        Assert.True(_sut.TryDequeue(queueId, out _));
    }

    [Fact(DisplayName = "Remove tira o guiche da espera")]
    public void Remove_ShouldTakeServiceLocationOutOfWaitingList()
    {
        var queueId = Guid.NewGuid();
        var serviceLocationId = Guid.NewGuid();

        _sut.Enqueue(queueId, serviceLocationId);
        _sut.Remove(queueId, serviceLocationId);

        Assert.False(_sut.TryDequeue(queueId, out _));
    }
}
