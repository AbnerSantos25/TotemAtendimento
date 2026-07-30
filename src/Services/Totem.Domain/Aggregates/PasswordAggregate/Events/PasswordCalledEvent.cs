using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é chamada para um local de atendimento (guichê).
    /// Relata o fato de negócio ocorrido — handlers independentes reagem a ele para
    /// gravar histórico e notificar em tempo real.
    /// </summary>
    public record PasswordCalledEvent(
        Guid PasswordId,
        Guid QueueId,
        Guid ServiceLocationId,
        string ServiceLocationName,
        Guid? OldServiceLocationId,
        string OldServiceLocationName,
        int Code,
        bool Preferential
    ) : INotification;
}
