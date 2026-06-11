using List.Tests.Models;

namespace List.Tests.Services;

public interface ITestQueueService
{
    public Task InitializeAsync();
    public IAsyncEnumerable<TestRun> ReadTestsAsync();
    public Task<bool> EnqueueTestAsync(Test test);
}