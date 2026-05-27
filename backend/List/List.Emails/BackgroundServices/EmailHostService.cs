using List.Emails.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace List.Emails.BackgroundServices;

public class EmailHostService(IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await ProcessEmails(stoppingToken);
    }
    
    private async Task ProcessEmails(CancellationToken stoppingToken)
    {
        using var scope = serviceScopeFactory.CreateScope();
        var queueService = scope.ServiceProvider.GetRequiredService<IEmailQueueService>();
        
        await queueService.InitializeAsync();

        await foreach (var email in queueService.ReadAllAsync(stoppingToken))
        {
            var sendEmailService = scope.ServiceProvider.GetRequiredService<ISendEmailService>();
            await sendEmailService.SendEmailAsync(email);
        }
    }
}