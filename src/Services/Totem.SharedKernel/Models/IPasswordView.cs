namespace Totem.SharedKernel.Models
{
	public interface IPasswordView
	{
		public Guid PasswordId { get; set; }
		public int Code { get; set; }
		public DateTime CreatedAt { get; set; }
		public bool Served { get; set; }
		public bool Preferential { get; set; }
	}
}
