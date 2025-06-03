using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Data;
using Totem.API.Configuration;
using Totem.API.RealTime;
using Totem.Application.Configurations;
using Totem.Application.Events;
using Totem.Application.Events.Notifications;
using Totem.Common.API.Configurations;
using Totem.Domain.Aggregates.PasswordAggregate.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Adiciona os DbContexts ao container de injeção de dependências;
builder.Services.AddDbContexts();
builder.Services.AddIdentityConfiguration(builder.Configuration);

// Adiciona as dependências do projeto e a coneção com o banco;
builder.Services.RegisterDependency(builder.Configuration);
builder.Services.TotemRegisterDependency();
builder.Services.AddSwaggerConfiguration(builder.Configuration);
builder.Services.AddEventsConfiguration();

// SignalR (opcional)
builder.Services.AddSignalR();

//TODO excluir dps do teste
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:7275") // ou o endereço da sua página html
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var serviceProvider = scope.ServiceProvider;
    await IdentitySeeder.SeedRolesAsync(serviceProvider);
}

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
	app.UseSwagger();
	app.UseSwaggerUI(c =>
	{
		c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API V1");
	});
}

app.UseCors();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
