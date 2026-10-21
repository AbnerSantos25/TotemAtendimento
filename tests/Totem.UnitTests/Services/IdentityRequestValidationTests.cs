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

    private static string[] Messages(Totem.Common.Validation.Contract contract) =>
        contract.Notifications.Select(n => n.Message).ToArray();

    private static string Required(string label) => string.Format(Errors.RequiredField, label);

    [Fact(DisplayName = "Login exige e-mail e senha, sem regra de tamanho")]
    public void AllowedLogin()
    {
        Assert.Empty(Messages(IdentityRequestValidation.AllowedLogin("a@b.com", "x")));
        Assert.Equal(
            new[] { Required(Labels.Email), Required(Labels.Password) },
            Messages(IdentityRequestValidation.AllowedLogin(null, "")));
    }

    [Fact(DisplayName = "Cadastro válido passa")]
    public void AllowedRegister_WhenValid_ShouldPass()
    {
        Assert.Empty(Messages(IdentityRequestValidation.AllowedRegister("Ana Souza", "ana@exemplo.com", "Senha@1", "Senha@1")));
    }

    [Fact(DisplayName = "Cadastro vazio devolve todas as mensagens em pt-BR de uma vez")]
    public void AllowedRegister_WhenEmpty_ShouldReturnAllMessages()
    {
        Assert.Equal(
            new[]
            {
                string.Format(Errors.LengthBetweenField, Labels.FullName, IdentityRequestValidation.FullNameMinLength, IdentityRequestValidation.FullNameMaxLength),
                Required(Labels.Email),
                string.Format(Errors.LengthBetweenField, Labels.Password, IdentityRequestValidation.PasswordMinLength, IdentityRequestValidation.PasswordMaxLength),
            },
            Messages(IdentityRequestValidation.AllowedRegister(null, null, null, null)));
    }

    [Theory(DisplayName = "E-mail fora do formato é recusado")]
    [InlineData("ana")]
    [InlineData("ana@")]
    [InlineData("Ana <ana@exemplo.com>")]
    public void AllowedRegister_WhenEmailInvalid_ShouldFail(string email)
    {
        Assert.Equal(
            new[] { string.Format(Errors.InvalidFormat, Labels.Email) },
            Messages(IdentityRequestValidation.AllowedRegister("Ana Souza", email, "Senha@1", "Senha@1")));
    }

    [Fact(DisplayName = "Cadastro com confirmação diferente é recusado")]
    public void AllowedRegister_WhenConfirmationDiffers_ShouldFail()
    {
        Assert.Equal(
            new[] { Errors.PasswordsMismatch },
            Messages(IdentityRequestValidation.AllowedRegister("Ana Souza", "ana@exemplo.com", "Senha@1", "Senha@2")));
    }

    [Fact(DisplayName = "Troca de senha: obrigatórios, nova diferente da atual e confirmação igual")]
    public void AllowedChangePassword()
    {
        Assert.Empty(Messages(IdentityRequestValidation.AllowedChangePassword("Antiga@1", "Nova@1", "Nova@1")));
        Assert.Equal(
            new[] { Required(Labels.CurrentPassword), Required(Labels.NewPassword) },
            Messages(IdentityRequestValidation.AllowedChangePassword(null, null, null)));
        Assert.Equal(
            new[] { Errors.PasswordCannotBeEqual },
            Messages(IdentityRequestValidation.AllowedChangePassword("Igual@1", "Igual@1", "Igual@1")));
        Assert.Equal(
            new[] { Errors.PasswordConfirmationMismatch },
            Messages(IdentityRequestValidation.AllowedChangePassword("Antiga@1", "Nova@1", "Outra@1")));
    }

    [Fact(DisplayName = "Troca de e-mail: formato, confirmação e senha")]
    public void AllowedUpdateEmail()
    {
        Assert.Empty(Messages(IdentityRequestValidation.AllowedUpdateEmail("novo@exemplo.com", "novo@exemplo.com", "Senha@1")));
        Assert.Equal(
            new[] { string.Format(Errors.InvalidFormat, Labels.Email), Errors.EmailConfirmationMismatch, Required(Labels.Password) },
            Messages(IdentityRequestValidation.AllowedUpdateEmail("x", "y", "")));
        Assert.Contains(
            string.Format(Errors.MaxLengthField, Labels.Email, IdentityRequestValidation.EmailMaxLength),
            Messages(IdentityRequestValidation.AllowedUpdateEmail(
                new string('a', IdentityRequestValidation.EmailMaxLength) + "@b.com",
                new string('a', IdentityRequestValidation.EmailMaxLength) + "@b.com",
                "Senha@1")));
    }

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
