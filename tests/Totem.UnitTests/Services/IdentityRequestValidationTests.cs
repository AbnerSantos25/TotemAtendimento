using Totem.Application.Services.IdentityServices;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;

namespace Totem.UnitTests.Services;

public class IdentityRequestValidationTests
{
    private static string[] Roles(List<Role>? roles) =>
        IdentityRequestValidation.AllowedAssignRoles(roles).Notifications.Select(n => n.Message).ToArray();

    private static string[] QueuePermissions(List<Guid>? queueIds) =>
        IdentityRequestValidation.AllowedSetQueuePermissions(queueIds).Notifications.Select(n => n.Message).ToArray();

    [Fact(DisplayName = "Papéis existentes passam")]
    public void AllowedAssignRoles_WhenValid_ShouldPass()
    {
        Assert.Empty(Roles([Role.User, Role.Manager]));
    }

    [Fact(DisplayName = "Lista de papéis vazia ou nula é recusada")]
    public void AllowedAssignRoles_WhenEmpty_ShouldFail()
    {
        Assert.Equal(new[] { Errors.PermissionListCannotBeEmpty }, Roles([]));
        Assert.Equal(new[] { Errors.PermissionListCannotBeEmpty }, Roles(null));
    }

    [Theory(DisplayName = "Papel fora do enum é recusado (antes estourava 500 no AddToRolesAsync)")]
    [InlineData(0)]
    [InlineData(99)]
    public void AllowedAssignRoles_WhenRoleUndefined_ShouldFail(int role)
    {
        Assert.Equal(new[] { Errors.InvalidRole }, Roles([Role.User, (Role)role]));
    }

    [Fact(DisplayName = "Filas nulas são recusadas; lista vazia vale (tira o acesso a todas)")]
    public void AllowedSetQueuePermissions()
    {
        Assert.Equal(new[] { string.Format(Errors.RequiredField, Labels.Queues) }, QueuePermissions(null));
        Assert.Empty(QueuePermissions([]));
        Assert.Empty(QueuePermissions([Guid.NewGuid()]));
    }
}
