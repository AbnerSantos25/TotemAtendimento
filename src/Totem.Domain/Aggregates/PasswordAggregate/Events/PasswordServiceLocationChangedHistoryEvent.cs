using MediatR;

public record PasswordServiceLocationChangedHistoryEvent(Guid PasswordId, Guid? OldServiceLocationId, Guid? NewServiceLocationId, string OldDescription, string NewDescription, int Code) : INotification;
