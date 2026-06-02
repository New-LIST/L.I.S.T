using List.Tests.Data;
using Microsoft.Extensions.Configuration;

namespace List.Tests.Models;

public class TestQueue
{
    private readonly TestsDbContext _dbContext;
    private readonly PriorityQueue<TestRun, int> _queue = new();
    private readonly AutoResetEvent _queueChanged = new(false);

    public TestQueue(IConfiguration configuration, TestsDbContext dbContext)
    {
        _dbContext = dbContext;
        var testsConfig = new TestsOptions();
        configuration.GetSection(TestsOptions.ConfigSection).Bind(testsConfig);
    }

    public async Task InitializeAsync()
    {
        foreach (var testRun in _dbContext.TestRuns)
        {
            await EnqueueAsync(testRun);
        }
    }

    public bool Enqueue(TestRun run)
    {
        lock (_queue)
            _queue.Enqueue(run, run.Priority);
        _queueChanged.Set();
        return true;
    }
    
    public async Task<bool> EnqueueAsync(TestRun run) => await Task.Run(() => Enqueue(run));
    
    public TestRun? Dequeue()
    {
        lock (_queue)
            return _queue.Dequeue();
    }
    
    public async Task<TestRun?> DequeueAsync() => await Task.Run(Dequeue);


    public async IAsyncEnumerable<TestRun> ReadAll()
    {
        while (true)
        {
            _queueChanged.WaitOne();
            var run = await DequeueAsync();
            if (run is null) continue;
            yield return run;
        }
    }
}