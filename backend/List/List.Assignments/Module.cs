using List.Common.Integrations;
using List.Assignments.Data;
using List.Assignments.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Assignments;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AssignmentsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<IAssignmentTaskRelService, AssignmentTaskRelService>();
        services.AddScoped<IEvaluationService, EvaluationService>();
        services.AddScoped<IGradeMatrixService, GradeMatrixService>();

    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}