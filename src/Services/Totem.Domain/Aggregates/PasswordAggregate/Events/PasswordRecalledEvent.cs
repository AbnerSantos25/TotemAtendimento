using MediatR;

namespace Totem.Domain.Aggregates.PasswordAggregate.Events
{
    /// <summary>
    /// Evento de domínio publicado quando uma senha é reconvocada em um local de atendimento.
    /// Relata o fato de negócio ocorrido — handlers independentes reagem a ele
    /// para notificar o painel em tempo real.
    /// </summary>
    public record PasswordRecalledEvent(
        Guid ServiceLocationId,
        int Code,
        string ServiceLocationName
    ) : INotification;
}
