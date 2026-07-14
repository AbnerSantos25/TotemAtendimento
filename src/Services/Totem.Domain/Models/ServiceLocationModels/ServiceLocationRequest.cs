using System.ComponentModel.DataAnnotations;
using Totem.Common.Validation;

namespace Totem.Domain.Models.ServiceLocationModels
{
    public class ServiceLocationRequest
    {
		[RequiredValidation]
        [StringLengthValidation(3,100)]
		public string Name { get; set; }
        public int Number { get; set; }
	}
}
