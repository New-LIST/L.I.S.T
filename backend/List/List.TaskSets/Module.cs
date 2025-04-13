using List.Common.Integrations;
using List.TaskSets.Data;
using List.TaskSets.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.TaskSets;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TaskSetsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICourseTaskSetRelService, CourseTaskSetRelService>();
        services.AddScoped<ITaskSetTypeService, TaskSetTypeService>();
        

    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}
