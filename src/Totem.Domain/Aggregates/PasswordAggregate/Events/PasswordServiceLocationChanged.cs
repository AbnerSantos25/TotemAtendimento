using MediatR;

public record PasswordServiceLocationChangedEvent(Guid PasswordId, Guid? OldServiceLocationId, Guid? NewServiceLocationId) : INotification;
