using System.Diagnostics;
using Totem.API.Configuration;
using Totem.Application.Configurations;
using Totem.Common.API.Configurations;
using Totem.Infra.Data;

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


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
