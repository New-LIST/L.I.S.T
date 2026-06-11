using List.Tests.Models;

namespace List.Tests.Services;

public interface ITestRunService
{
    public Task<TestResult> RunTestAsync(TestRun testRun);
}