using List.Common.Integrations;
using List.Emails.BackgroundServices;
using List.Emails.Data;
using List.Emails.Models;
using List.Emails.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace List.Emails;

public class Module : IModule
{
    public void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<EmailsDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        
        services.AddSingleton<EmailQueue>();

        services.AddScoped<ISendEmailService, SendEmailService>();
        services.AddScoped<IEmailQueueService, EmailQueueService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();

        services.AddHostedService<EmailHostService>();
    }

    public void UseServices(IApplicationBuilder app)
    {
    }
}