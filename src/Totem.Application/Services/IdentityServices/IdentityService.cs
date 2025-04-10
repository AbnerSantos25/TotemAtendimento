using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Totem.Common.Domain.Notification;
using Totem.Common.Extension;
using Totem.Common.Services;
using Totem.Domain.Models.IdentityModels;

namespace Totem.Application.Services.IdentityServices
{
    public class IdentityService : BaseService, IIdentityService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public IdentityService(INotificador notificador, UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IOptions<JwtSettings> jwtSettings) : base(notificador)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<(Result Result, string Data)> GenerateJwtTokenAsync()
        {
            var Key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            var token = tokenHandler.CreateToken(new SecurityTokenDescriptor
            {
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.ValidAt,
                Expires = DateTime.UtcNow.AddHours(_jwtSettings.ExpirationTime),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            });

            var encodedToken = tokenHandler.WriteToken(token);

            return Successful(encodedToken);
        }

        public async Task<(Result Result, string Data)> LoginUserAsync(LoginUserView loginUserView)
        {
            var result = await _signInManager.PasswordSignInAsync(loginUserView.Email, loginUserView.Password, false, true);
            if (result.Succeeded)
            {
                return await GenerateJwtTokenAsync();
            }

            if (result.IsLockedOut)
            {
                //TODO: (Abner) Globalizar mensagem
                Notificar("Usuário temporariamente bloqueado por tentativas inválidas.");
                return Unsuccessful<string>();
            }

            Notificar("Usuário ou senha incorretos.");
            return Unsuccessful<string>();
        }

        public async Task<(Result Result, string Data)> RegisterUserAsync(RegisterUserView registerUserView)
        {
            var user = new IdentityUser
            {
                UserName = registerUserView.Email,
                Email = registerUserView.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, registerUserView.Password);
            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, false);
                return await GenerateJwtTokenAsync();
            }

            foreach (var error in result.Errors)
            {
                Notificar(error.Description);
            }

            return Unsuccessful<string>();
        }
    }
}
