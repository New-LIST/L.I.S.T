using List.Tests.Models;

namespace List.Tests.Services;

public interface ICompareOutputService
{
    public Task<string> Compare(Test test, string filePath, List<string> inputLines);
}