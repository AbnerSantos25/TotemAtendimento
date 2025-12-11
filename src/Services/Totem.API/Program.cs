using Totem.API.Configuration;
using Totem.API.RealTime;
using Totem.Application.Configurations;
using Totem.Common.API.Configurations;

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

if (app.Environment.IsDevelopment())
{
    app.MapHub<PasswordHub>("/passwordHub");
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API V1");
        // c.RoutePrefix = string.Empty; // para servir em ‘/’
    });
}

app.UseCors();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
