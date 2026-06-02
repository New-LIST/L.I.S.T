using List.Common.Integrations;
using List.Tests.BackgroundServices;
using List.Tests.Data;
using List.Tests.Models;
using List.Tests.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Tests;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TestsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddSingleton<TestQueue>(); 
        
        services.AddScoped<ITestService, TestService>();
        services.AddScoped<ITestRunService, TestRunService>();
        services.AddScoped<ITestQueueService, TestQueueService>();
        
        services.AddHostedService<TestHostService>();
    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}
