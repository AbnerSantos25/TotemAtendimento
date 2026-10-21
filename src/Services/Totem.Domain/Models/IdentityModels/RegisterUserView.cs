namespace Totem.Domain.Models.IdentityModels
{
    public class RegisterUserView
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
		public string FullName { get; set; }
	}
}
