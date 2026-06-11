using List.Tests.Data;
using List.Tests.Models;

namespace List.Tests.Services;

public class TestRunService(TestsDbContext context,
                            ITestService testService,
                            ITestQueueService testQueueService) : ITestRunService
{
    public async Task<TestResult> RunTestAsync(TestRun testRun)
    {
        return new TestResult();
    }

}