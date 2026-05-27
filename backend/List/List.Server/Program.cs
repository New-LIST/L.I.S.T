using System.Text;
using System.Threading.RateLimiting;
using List.Common.Integrations;
using List.Logs.Services;
using List.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using List.Common.Files;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<RateLimitingOptions>(builder.Configuration.GetSection(RateLimitingOptions.ConfigSection));

var rateLimitOptions = new RateLimitingOptions();
builder.Configuration.GetSection(RateLimitingOptions.ConfigSection).Bind(rateLimitOptions);

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(RateLimitingOptions.FixedPolicy, opt =>
    {
        opt.PermitLimit = rateLimitOptions.PermitLimit;
        opt.Window = TimeSpan.FromSeconds(rateLimitOptions.Window);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = rateLimitOptions.QueueLimit;
    }); 
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var config = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Issuer"],
            ValidAudience = config["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Key"]))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


builder.Services.AddControllers(options =>
{
    options.Filters.Add<ActivityLoggingFilter>();
});

builder.Services.AddScoped<IFileStorageService, FileStorageService>();

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});

builder.Services.AddModule<List.Users.Module>(builder.Configuration);
builder.Services.AddModule<List.Courses.Module>(builder.Configuration);
builder.Services.AddModule<List.TaskSets.Module>(builder.Configuration);
builder.Services.AddModule<List.Emails.Module>(builder.Configuration);
builder.Services.AddModule<List.Tasks.Module>(builder.Configuration);
builder.Services.AddModule<List.Assignments.Module>(builder.Configuration);
builder.Services.AddModule<List.Logs.Module>(builder.Configuration);
builder.Services.AddModule<List.Tests.Module>(builder.Configuration);


var app = builder.Build();

    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "List API");
    });

app.UseModule<List.Users.Module>();
app.UseModule<List.Courses.Module>();
app.UseModule<List.TaskSets.Module>();
app.UseModule<List.Emails.Module>();
app.UseModule<List.Tasks.Module>();
app.UseModule<List.Assignments.Module>();
app.UseModule<List.Logs.Module>();
app.UseModule<List.Tests.Module>();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers()
    .RequireRateLimiting(RateLimitingOptions.FixedPolicy);

app.Run();