using System.ComponentModel.DataAnnotations;
using Totem.Common.Localization.Resources;

namespace Totem.Domain.Models.PasswordModels
{
    public class PasswordRequest
    {
        [Required]
        [StringLength(50,ErrorMessageResourceName = "PasswordRequestNull", ErrorMessageResourceType = typeof(Errors))]
        public string Code { get; set; }
        [Required]
        public Guid QueueId { get; set; }
    }
}
