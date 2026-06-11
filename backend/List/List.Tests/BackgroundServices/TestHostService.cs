using List.Tests.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace List.Tests.BackgroundServices;

public class TestHostService(IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        throw new NotImplementedException();
    }

    private async Task RunTestsAsync()
    {
        using var scope = serviceScopeFactory.CreateScope();
        var testQueueService = scope.ServiceProvider.GetRequiredService<ITestQueueService>();
        var testRunService = scope.ServiceProvider.GetRequiredService<ITestRunService>();

        await testQueueService.InitializeAsync();

        await foreach (var testRun in testQueueService.ReadTestsAsync())
        {
            await testRunService.RunTestAsync(testRun);
        }
    }
}
