using List.BackgroundTasks.Data;
using List.BackgroundTasks.Services;
using List.Common.Integrations;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.BackgroundTasks;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BackgroundTasksDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ISendEmailService, SendEmailService>();
    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}