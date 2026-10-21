using Totem.Common.Enumerations;

public class AssignRolesRequest
{
    public Guid UserId { get; set; }
    public List<Role> Roles { get; set; }
}