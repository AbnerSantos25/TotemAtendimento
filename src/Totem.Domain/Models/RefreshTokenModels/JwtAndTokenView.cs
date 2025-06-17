using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Domain.Models.RefreshTokenModels
{
	public class JwtAndTokenView
	{
		public string JWT { get; set; }
		public Guid NewToken { get; set; }
	}
}
