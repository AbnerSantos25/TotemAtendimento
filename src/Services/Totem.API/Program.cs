using Serilog;
using Serilog.Events;
using Totem.API.Configuration;
using Totem.API.RealTime;
using Totem.Application.Configurations;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Warning()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Error)
    .WriteTo.File(
        path: "logs/erros-totem-.txt",
        rollingInterval: RollingInterval.Day,
        restrictedToMinimumLevel: LogEventLevel.Error,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

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
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
