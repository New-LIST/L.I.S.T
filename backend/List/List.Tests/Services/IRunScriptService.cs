namespace List.Tests.Services;

public interface IRunScriptService
{
    public Task<IEnumerable<string>> RunScriptAsync(string relativePath, List<string> arguments, List<string> inputLines);
}