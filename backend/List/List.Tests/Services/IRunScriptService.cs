using List.Tests.Models;

namespace List.Tests.Services;

public interface IRunScriptService
{
    public Task<TestResult> RunScriptAsync(Test test, List<string> inputLines);
    
}