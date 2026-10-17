using MediatR;

namespace Totem.Application.Events.Contracts
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
