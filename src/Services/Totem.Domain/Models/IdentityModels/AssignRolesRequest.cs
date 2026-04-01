using Totem.Common.Enumerations;
using Totem.Common.Validation;

public class AssignRolesRequest
{
    [RequiredValidation]
    public Guid UserId { get; set; }
    [RequiredValidation]
    public List<Role> Roles { get; set; }
}