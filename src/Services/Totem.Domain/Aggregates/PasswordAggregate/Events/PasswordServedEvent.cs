using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é marcada como atendida.
    /// Relata o fato de negócio ocorrido — handlers independentes reagem a ele para
    /// gravar histórico e notificar em tempo real.
    /// </summary>
    public record PasswordServedEvent(
        Guid PasswordId,
        Guid QueueId,
        Guid ServiceLocationId,
        string ServiceLocationName,
        int Code,
        bool Preferential
    ) : INotification;
}
