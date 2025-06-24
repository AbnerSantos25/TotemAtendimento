using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;
using Totem.Common.Validation;

namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordRequest
    {
		[RequiredValidation]
		public Guid QueueId { get; set; }
        public bool Preferential { get; set; }

    }
}
