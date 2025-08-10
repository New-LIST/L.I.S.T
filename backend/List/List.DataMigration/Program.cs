using List.DataMigration.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration.GetSection("Jwt");

builder.Services.AddDbContext<OldListDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("OldListConnection")));

builder.Services.AddDbContext<NewListDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("NewListConnection")));

var app = builder.Build();

app.UseHttpsRedirection();

app.Run();