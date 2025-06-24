using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.QueueModels
{
    public class QueueRequest
    {
		[RequiredValidation]
		public string Name { get; set; }
        public bool Active { get; set; }
    }
}
