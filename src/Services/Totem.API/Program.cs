using Totem.API.Configuration;
using Totem.API.RealTime;
using Totem.Application.Configurations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContexts(builder.Configuration);
builder.Services.AddIdentityConfiguration(builder.Configuration);

builder.Services.TotemRegisterDependency();
builder.Services.AddSwaggerConfiguration(builder.Configuration);
builder.Services.AddEventsConfiguration();

builder.Services.AddSignalR();

//TODO excluir dps do teste
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
		policy.WithOrigins("http://localhost:7275", "http://localhost:5173")
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
    });
}

app.UseCors();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
