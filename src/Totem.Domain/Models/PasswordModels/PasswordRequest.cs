namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordRequest
    {
        public string Code { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Served { get; set; }
        public Guid ServiceLocationId { get; set; }
    }
}
