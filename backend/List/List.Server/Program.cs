﻿using System.Text;
using System.Threading.RateLimiting;
using List.Common.Integrations;
using List.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "List API",
        Description = "Backend GET/POST/PUT/DELETE"
    });
});

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

builder.Services.AddControllers();

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});

builder.Services.AddModule<List.Users.Module>(builder.Configuration);
builder.Services.AddModule<List.Courses.Module>(builder.Configuration);
builder.Services.AddModule<List.TaskSets.Module>(builder.Configuration);
builder.Services.AddModule<List.BackgroundTasks.Module>(builder.Configuration);
builder.Services.AddModule<List.Tasks.Module>(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "List API");
    });
}

app.UseModule<List.Users.Module>();
app.UseModule<List.Courses.Module>();
app.UseModule<List.TaskSets.Module>();
app.UseModule<List.BackgroundTasks.Module>();
app.UseModule<List.Tasks.Module>();

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers()
    .RequireRateLimiting(RateLimitingOptions.FixedPolicy);

app.Run();