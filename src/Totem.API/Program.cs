using System.Diagnostics;
using Totem.Application.Configurations;
using Totem.Common.API.Configurations;
using Totem.Infra.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Adiciona os DbContexts ao container de injeção de dependências;
builder.Services.AddTotemDBContext();

// Adiciona as dependências do projeto e a coneção com o banco;
builder.Services.RegisterDependency(builder.Configuration);
builder.Services.TotemRegisterDependency();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TotemDbContext>();
    bool canConnect = await context.Database.CanConnectAsync();

    if (canConnect)
    {
        Debug.WriteLine("Conexão com o banco realizada com sucesso!");
    }
    else
    {
        Debug.WriteLine("Falha ao conectar com o banco.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
