using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Totem.Common.API.Configurations;
using Totem.Common.Extension;
using Totem.Infra.Data.IdentityData;

namespace Totem.API.Configuration
{
    public static class IdentityConfiguration
    {
        public static IServiceCollection AddIdentityConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddIdentity<IdentityUser, IdentityRole>()
            .AddEntityFrameworkStores<AppIdentityDbContext>()
            .AddErrorDescriber<IdentityCustomMenssages>()
            .AddRoles<IdentityRole>()
			.AddDefaultTokenProviders();

            //JWT

            var AppSettingsSection = configuration.GetSection("Jwt");
            services.Configure<JwtSettings>(AppSettingsSection);

            var jwtSettings = AppSettingsSection.Get<JwtSettings>();
            var Key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            }).AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = true;
                x.SaveToken = true; //se deve ser guardado no autentication properties, para validar o usuario logado
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.ValidAt,
                    ValidIssuer = jwtSettings.Issuer
                };
            });

            services.AddAuthorization();

            return services;
        }
    }
}
