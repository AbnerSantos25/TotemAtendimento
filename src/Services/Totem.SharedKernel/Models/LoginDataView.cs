namespace Totem.SharedKernel.Models
{
	public class LoginDataView
	{
		public string JWT { get; set; }
		public Guid NewToken { get; set; }
		public UserView? UserView { get; set; }
	}
}
