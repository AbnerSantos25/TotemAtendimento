using System.Net.Mail;
using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Application.Services.IdentityServices
{
	/// <summary>Regras de entrada do Identity que não pertencem a uma entidade do domínio.</summary>
	public static class IdentityRequestValidation
	{
		public const int EmailMaxLength = 100;
		public const int FullNameMinLength = 3;
		public const int FullNameMaxLength = 200;
		public const int PasswordMinLength = 6;
		public const int PasswordMaxLength = 100;

		// Sem regra de tamanho: credencial fora do padrão cai em "usuário ou senha incorretos", como qualquer outra.
		public static Contract AllowedLogin(string? email, string? password) =>
			new Contract().Requires()
				.IsNotNullOrEmpty(email, Errors.RequiredField)
					.AddLabelArgument(Labels.Email)
				.IsNotNullOrEmpty(password, Errors.RequiredField)
					.AddLabelArgument(Labels.Password)
				.Apply();

		public static Contract AllowedRegister(string? fullName, string? email, string? password, string? confirmPassword) =>
			new Contract().Requires()
				.HasLengthBetween(fullName, FullNameMinLength, FullNameMaxLength, Errors.LengthBetweenField)
					.AddLabelArgument(Labels.FullName).AddArguments(FullNameMinLength, FullNameMaxLength)
				.IsValid(AllowedEmail(email))
				.HasLengthBetween(password, PasswordMinLength, PasswordMaxLength, Errors.LengthBetweenField)
					.AddLabelArgument(Labels.Password).AddArguments(PasswordMinLength, PasswordMaxLength)
				.IsTrue(confirmPassword == password, Errors.PasswordsMismatch)
				.Apply();

		public static Contract AllowedChangePassword(string? oldPassword, string? newPassword, string? confirmNewPassword) =>
			new Contract().Requires()
				.IsNotNullOrEmpty(oldPassword, Errors.RequiredField)
					.AddLabelArgument(Labels.CurrentPassword)
				.IsNotNullOrEmpty(newPassword, Errors.RequiredField)
					.AddLabelArgument(Labels.NewPassword)
				.When(!string.IsNullOrEmpty(newPassword), c => c.IsTrue(newPassword != oldPassword, Errors.PasswordCannotBeEqual))
				.IsTrue(confirmNewPassword == newPassword, Errors.PasswordConfirmationMismatch)
				.Apply();

		public static Contract AllowedUpdateEmail(string? newEmail, string? confirmEmail, string? password) =>
			new Contract().Requires()
				.IsValid(AllowedEmail(newEmail))
				.IsTrue(confirmEmail == newEmail, Errors.EmailConfirmationMismatch)
				.IsNotNullOrEmpty(password, Errors.RequiredField)
					.AddLabelArgument(Labels.Password)
				.Apply();

		public static Contract AllowedAssignRoles(IReadOnlyCollection<Role>? roles) =>
			new Contract().Requires()
				.IsTrue(roles is { Count: > 0 }, Errors.PermissionListCannotBeEmpty)
				// O JSON aceita qualquer número no enum; papel fora dele estoura no AddToRolesAsync.
				.IsTrue(roles is null || roles.All(r => Enum.IsDefined(r)), Errors.InvalidRole)
				.Apply();

		public static Contract AllowedSetQueuePermissions(IReadOnlyCollection<Guid>? queueIds) =>
			new Contract().Requires()
				.IsTrue(queueIds is not null, Errors.RequiredField)
					.AddLabelArgument(Labels.Queues)
				.Apply();

		private static Contract AllowedEmail(string? email) =>
			new Contract().Requires()
				.IsNotNullOrEmpty(email, Errors.RequiredField)
					.AddLabelArgument(Labels.Email)
				.HasMaxLength(email, EmailMaxLength, Errors.MaxLengthField)
					.AddLabelArgument(Labels.Email).AddArguments(EmailMaxLength)
				.When(!string.IsNullOrEmpty(email), c => c.IsTrue(IsEmail(email!), Errors.InvalidFormat).AddLabelArgument(Labels.Email))
				.Apply();

		// O Address igual ao valor recusa a forma "Nome <a@b.com>", que o MailAddress também aceita.
		private static bool IsEmail(string value) =>
			MailAddress.TryCreate(value, out var address) && address.Address == value;
	}
}
