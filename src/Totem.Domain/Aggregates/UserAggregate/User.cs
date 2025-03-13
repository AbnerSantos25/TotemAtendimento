namespace Totem.Domain.Aggregates.UserAggregate
{
	public class User : Entity
	{
		public string Name { get; private set; }
		public string HashedPassword { get; private set; }

		public void SetPassword(string password)
		{
			HashedPassword = ComputeHash(password);
		}
		private string ComputeHash(string input)
		{
			using (var sha256 = System.Security.Cryptography.SHA256.Create())
			{
				byte[] bytes = System.Text.Encoding.UTF8.GetBytes(input);
				byte[] hashBytes = sha256.ComputeHash(bytes);
				return Convert.ToBase64String(hashBytes);
			}
		}

		public User(string name, string hashedPassword)
		{
			//TODO: Validations
			Name = name;
			SetPassword(hashedPassword);
		}
	}
}
