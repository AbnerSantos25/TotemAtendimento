using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Totem.Common.Enumerations;

namespace Totem.API.Configuration;

/// <summary>
/// Permite que usuários com a role "Admin" satisfaçam qualquer <see cref="RolesAuthorizationRequirement"/>,
/// independente das roles declaradas no [Authorize(Roles = "...")].
/// </summary>
public class AdminBypassAuthorizationHandler : AuthorizationHandler<RolesAuthorizationRequirement>
{
    private const string AdminRole = nameof(Role.Admin);

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RolesAuthorizationRequirement requirement)
    {
        if (context.User.IsInRole(AdminRole))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
