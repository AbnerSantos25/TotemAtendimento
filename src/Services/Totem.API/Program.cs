using Totem.API.Configuration;
using Totem.API.RealTime;
using Totem.Application.Configurations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiConfiguration(builder.Configuration, builder.Environment);
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContexts(builder.Configuration);
builder.Services.AddIdentityConfiguration(builder.Configuration);

builder.Services.TotemRegisterDependency();
builder.Services.AddSwaggerConfiguration(builder.Configuration);
builder.Services.AddEventsConfiguration();

builder.Services.AddSignalR();
// Antiforgery e Cors configurados em ApiConfiguration

builder.Services.AddRateLimitingConfiguration();

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

app.UseMiddleware<Totem.API.Middleware.GlobalExceptionMiddleware>();

app.MapHub<PasswordHub>("/api/passwordHub");

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
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Em dev, o certificado auto-assinado impede conexões de dispositivos mobile
}
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseCsrfMiddleware();

app.MapControllers();

app.Run();
