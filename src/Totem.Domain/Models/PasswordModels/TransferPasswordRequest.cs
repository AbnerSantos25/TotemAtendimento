using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.PasswordModels
{
    public class TransferPasswordRequest
    {
		[RequiredValidation]
		public Guid PasswordId { get; set; }
		[RequiredValidation]
		public Guid NewQueueId { get; set; }
    }

}
