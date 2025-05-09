using List.Common.Integrations;
using List.Logs.Data;
using List.Logs.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Logs;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<LogsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ILogService, LogService>();
        services.AddScoped<ActivityLoggingFilter>();
        
    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}
