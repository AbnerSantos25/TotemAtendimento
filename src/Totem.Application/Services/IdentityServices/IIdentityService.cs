using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
    public interface IIdentityService 
    {
        Task<(Result Result, string Data)> GenerateJwtTokenAsync();
        Task<(Result Result, string Data)> RegisterUserAsync(RegisterUserView registerUserView);
        Task<(Result Result, string Data)> LoginUserAsync(LoginUserView loginUserView);
    }
}
