using List.Tests.Models;

namespace List.Tests.Services;

public class CompareOutputService(IRunScriptService runScriptService) : ICompareOutputService
{
    public async Task<string> Compare(Test test, string filePath, List<string> inputLines)
    {
        return "";
    }
}