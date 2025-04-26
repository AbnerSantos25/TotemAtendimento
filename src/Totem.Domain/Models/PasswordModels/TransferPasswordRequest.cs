using System.ComponentModel.DataAnnotations;

namespace Totem.Domain.Models.PasswordModels
{
    public class TransferPasswordRequest
    {
        [Required]
        public Guid PasswordId { get; set; }
        [Required]
        public Guid NewQueueId { get; set; }
    }

}
