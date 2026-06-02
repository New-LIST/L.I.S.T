using List.Tests.Data;
using List.Tests.Models;

namespace List.Tests.Services;

public class TestQueueService(TestQueue queue, ITestService testService, TestsDbContext dbContext) : ITestQueueService
{
    public async Task InitializeAsync() => await queue.InitializeAsync();

    public IAsyncEnumerable<TestRun> ReadTestsAsync() => queue.ReadAll();
    
    public async Task<bool> EnqueueTestAsync(Test test)
    {
        var testRun = CreateTestRun(test);
        await dbContext.TestRuns.AddAsync(testRun);
        await dbContext.SaveChangesAsync();
        
        return await queue.EnqueueAsync(testRun);
    }

    private TestRun CreateTestRun(Test test)
    {
        return new TestRun();
    }
}