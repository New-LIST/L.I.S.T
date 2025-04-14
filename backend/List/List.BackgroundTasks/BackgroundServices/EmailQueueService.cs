using List.BackgroundTasks.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace List.BackgroundTasks.BackgroundServices;

public class EmailQueueService(IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using PeriodicTimer timer = new(TimeSpan.FromSeconds(5));

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await SendEmail();
            }
        }
        catch (OperationCanceledException)
        {
        }
    }
    
    private async Task SendEmail()
    {
        using var scope = serviceScopeFactory.CreateScope();

        var sendEmailService =
            scope.ServiceProvider.GetRequiredService<ISendEmailService>();
        
        await sendEmailService.SendEmailAsync();
    }
}