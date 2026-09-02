using MediatR;

namespace Totem.Application.Events.Contracts
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é chamada para um local de atendimento (guichê).
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
