using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordRequest
    {
        [Required]
        public Guid QueueId { get; set; }
        public bool Preferential { get; set; }

    }
}
