using Totem.Common.Enumerations;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Application.Services.IdentityServices
{
	/// <summary>Regras de entrada do Identity que não pertencem a uma entidade do domínio.</summary>
	public static class IdentityRequestValidation
	{
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
	}
}
