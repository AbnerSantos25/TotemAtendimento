using System.ComponentModel.DataAnnotations;
using Totem.Common.Enumerations;

namespace Totem.Domain.Models.IdentityModels
{
	public class AssignRoleRequest
	{
		[Required(ErrorMessage = "O ID do usuário é obrigatório.")]
		public string UserId { get; set; }

		[Required(ErrorMessage = "O nome da Role (perfil) é obrigatório.")]
		public Role Role { get; set; }
	}
}
