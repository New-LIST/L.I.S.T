using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Common.Integrations;

public interface IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration);
    public void UseServices(IApplicationBuilder app);
}