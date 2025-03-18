using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Application.Services.PasswordServices
{
	public interface IPasswordServices
	{
		Task AddPasswordAsync(string code);
	}
}
