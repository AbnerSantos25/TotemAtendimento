using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.ServiceLocationModels;
using Totem.SharedKernel.Models;

namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordView : IPasswordView
	{
        public Guid PasswordId { get; set; }
        public int Code { get; set; }
		public DateTime CreatedAt { get; set; }
		public bool Served { get; set; }
        public bool Preferential { get; set; }
        public ServiceLocationView? ServiceLocation { get; set; }

        public static implicit operator PasswordView(Password password)
        {
            return new PasswordView
            {
                PasswordId = password.Id,
                Code = password.Code,
                CreatedAt = password.CreatedAt,
                Served = password.Served,
                Preferential = password.Preferential,
                ServiceLocation = password.ServiceLocation != null ? new ServiceLocationView
                {
                    Name = password.ServiceLocation.Name,
                    Number = password.ServiceLocation.Number
                } : null
            };
        }
    }
}
