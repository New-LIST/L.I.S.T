using List.Common.Integrations;
using List.Tests.Data;
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

    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}
