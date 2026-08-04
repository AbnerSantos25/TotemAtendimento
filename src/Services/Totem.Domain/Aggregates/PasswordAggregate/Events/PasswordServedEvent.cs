using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é marcada como atendida.
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
