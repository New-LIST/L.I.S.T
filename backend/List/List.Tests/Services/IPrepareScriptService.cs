using List.Tests.Models;

namespace List.Tests.Services;

public interface IPrepareScriptService
{
    public Task<TestResult> PrepareScriptAsync(Test test);
}