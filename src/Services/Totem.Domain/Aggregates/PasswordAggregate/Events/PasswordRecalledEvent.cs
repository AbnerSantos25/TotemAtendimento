using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é reconvocada em um local de atendimento.
    /// </summary>
    public record PasswordRecalledEvent(
        Guid ServiceLocationId,
        int Code,
        string ServiceLocationName
    ) : INotification;
}
