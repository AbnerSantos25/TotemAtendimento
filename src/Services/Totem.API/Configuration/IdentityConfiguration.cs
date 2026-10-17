using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Totem.Common.Extension;
using Totem.Domain.Aggregates.UserAggregate;
using Totem.Infra.Data.IdentityData;

namespace Totem.API.Configuration
{
    public static class IdentityConfiguration
    {
        public static IServiceCollection AddIdentityConfiguration(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            services.AddIdentity<User, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppIdentityDbContext>()
            .AddErrorDescriber<IdentityCustomMessages>()
            .AddRoles<IdentityRole<Guid>>()
			.AddDefaultTokenProviders();

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
                x.RequireHttpsMetadata = !environment.IsDevelopment();
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.ValidAt,
                    ValidIssuer = jwtSettings.Issuer,
                    ClockSkew = TimeSpan.Zero
                };
                x.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // Prioridade 1: Header Authorization (Mobile - Bearer Token)
                        // O middleware JWT já lê o header por padrão, então só intervimos se NÃO houver header.
                        if (string.IsNullOrEmpty(context.Token))
                        {
                            // Prioridade 2: Query string (SignalR - o handshake WebSocket
                            // nao permite header Authorization, entao o cliente envia o
                            // token em ?access_token=). Restrito a rota do hub.
                            if (context.HttpContext.Request.Path.StartsWithSegments("/api/passwordHub"))
                                context.Token = context.Request.Query["access_token"];

                            // Prioridade 3: Cookie (Web - HttpOnly Cookie)
                            if (string.IsNullOrEmpty(context.Token))
                                context.Token = context.Request.Cookies["access_token"];
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddAuthorization();

            // Permite que usuários Admin satisfaçam qualquer [Authorize(Roles = "...")] automaticamente.
            services.AddSingleton<IAuthorizationHandler, AdminBypassAuthorizationHandler>();

            return services;
        }
    }
}
