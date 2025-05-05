using MediatR;

public record PasswordServiceLocationChangedHistoryEvent(Guid PasswordId, Guid? OldServiceLocationId, Guid? NewServiceLocationId) : INotification;
