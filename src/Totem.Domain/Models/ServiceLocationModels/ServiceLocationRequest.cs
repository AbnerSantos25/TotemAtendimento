using Totem.Common.Validation;

namespace Totem.Domain.Models.ServiceLocationModels
{
    public class ServiceLocationRequest
    {
		[RequiredValidation]
		public string Name { get; set; }
        public int? Number { get; set; }
    }
}
