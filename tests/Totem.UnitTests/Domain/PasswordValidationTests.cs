using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.UnitTests.Domain;

public class PasswordValidationTests
{
    private static string[] Messages(Password password) => password.Notifications.Select(n => n.Message).ToArray();

    private static Password Served()
    {
        var password = new Password(Guid.NewGuid(), preferential: false);
        password.AssignToServiceLocation(Guid.NewGuid());
        password.MarkAsServed();
        return password;
    }

    [Fact(DisplayName = "Fila vazia (Guid.Empty) é recusada na criação")]
    public void AllowedAdd_WhenQueueEmpty_ShouldFail()
    {
        Assert.Empty(PasswordConstructorValidation.AllowedAdd(Guid.NewGuid()).Notifications);
        Assert.Equal(
            new[] { string.Format(Errors.RequiredField, Labels.Queue) },
            PasswordConstructorValidation.AllowedAdd(Guid.Empty).Notifications.Select(n => n.Message));

        var ex = Assert.Throws<DomainException>(() => new Password(Guid.Empty, preferential: false));
        Assert.Equal(Errors.UnableCreatePassword, ex.Message);
    }

    [Fact(DisplayName = "Senha atendida não pode ser transferida nem chamada")]
    public void ServedPassword_CannotBeTransferredOrCalled()
    {
        var transfer = Served();
        Assert.False(transfer.Validations.AllowedTransfer(Guid.NewGuid()));
        Assert.Equal(new[] { Errors.PasswordCannotBeTransfered }, Messages(transfer));

        var call = Served();
        Assert.False(call.Validations.AllowedAssignToServiceLocation(Guid.NewGuid()));
        Assert.Equal(new[] { Errors.PasswordCannotBeTransfered }, Messages(call));
    }

    [Fact(DisplayName = "Transferir para fila vazia é recusado")]
    public void AllowedTransfer_WhenQueueEmpty_ShouldFail()
    {
        var password = new Password(Guid.NewGuid(), preferential: false);

        Assert.False(password.Validations.AllowedTransfer(Guid.Empty));
        Assert.Equal(new[] { string.Format(Errors.RequiredField, Labels.Queue) }, Messages(password));
    }

    [Fact(DisplayName = "Senha sem local de atendimento não pode ser atendida")]
    public void AllowedMarkAsServed_WithoutServiceLocation_ShouldFail()
    {
        var password = new Password(Guid.NewGuid(), preferential: false);

        Assert.False(password.Validations.AllowedMarkAsServed());
        Assert.Equal(new[] { Errors.PasswordCannotBeServed }, Messages(password));
    }

    [Fact(DisplayName = "Atender duas vezes é recusado com DomainException (antes era InvalidOperationException, 500)")]
    public void MarkAsServed_Twice_ShouldThrowDomainException()
    {
        var password = Served();

        Assert.False(password.Validations.AllowedMarkAsServed());
        Assert.Equal(new[] { Errors.PasswordAlreadyServed }, Messages(password));

        var ex = Assert.Throws<DomainException>(() => Served().MarkAsServed());
        Assert.Equal(Errors.UnableServePassword, ex.Message);
    }
}
