using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.ServiceLocationModels;

namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordView
    {
        private Guid PasswordId { get; set; }
        public string Code { get; set; }
		public DateTime CreatedAt { get; set; }
		public bool Served { get; set; }
		public ServiceLocationView ServiceLocation { get; set; }
        public bool Preferential { get; set; } // Pd73e

        public static implicit operator PasswordView(Password password)
        {
            return new PasswordView
            {
                PasswordId = password.Id,
                Code = password.Code,
                CreatedAt = password.CreatedAt,
                Served = password.Served,
                ServiceLocation = password.ServiceLocation,
                Preferential = password.Preferential // P4a59
            };
        }
    }
}
