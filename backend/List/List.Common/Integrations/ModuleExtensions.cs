using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Common.Integrations;

public static class ModuleExtensions
{
    public static IModule AddModule<TModule>(this IServiceCollection service, IConfiguration configuration) where TModule : IModule
    {
        var module = Activator.CreateInstance<TModule>();
        
        module.AddServices(service, configuration);
        
        return module;
    }

    public static void UseModule<TModule>(this IApplicationBuilder app) where TModule : IModule
    {
        var module = Activator.CreateInstance<TModule>();
        
        module.UseServices(app);
    }
}