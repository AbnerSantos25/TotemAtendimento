using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Totem.Application.Services.PasswordServices
{
	public interface IPasswordService
	{
		Task AddPasswordAsync(string code);
	}
}
