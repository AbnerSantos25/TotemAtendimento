namespace Totem.Domain.Models.IdentityModels
{
	public class UpdateEmailRequest
	{
		public string NewEmail { get; set; }
		public string ConfirmEmail { get; set; }
		public string Password { get; set; }
	}
}
