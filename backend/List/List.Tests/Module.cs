using List.Common.Integrations;
using List.Tests.Data;
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

        services.AddScoped<ITestService, TestService>();
        services.AddScoped<ICompareOutputService, CompareOutputService>();
        services.AddScoped<IRunScriptService, RunScriptService>();
    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}
