using List.Tests.Models;

namespace List.Tests.Services;

public class PrepareScriptService(IRunScriptService runScriptService) : IPrepareScriptService
{
    public async Task<TestResult> PrepareScriptAsync(Test test)
    {
        switch (test.Type)
        {
            case TestType.Python:
                await PreparePythonScriptAsync(test);
                break;
            case TestType.Java:
                await PrepareJavaScriptAsync(test);
                break;
            case TestType.C:
                await PrepareCScriptAsync(test);
                break;
            case TestType.Txt:
                await PrepareTextScriptAsync(test);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }
        
        var result = await runScriptService.RunScriptAsync(test, []);
        
        return result;
    }
    
    public async Task PreparePythonScriptAsync(Test test) { }
    public async Task PrepareCsharpScriptAsync(Test test) { }
    public async Task PrepareCScriptAsync(Test test) { }
    public async Task PrepareJavaScriptAsync(Test test) { }
    public async Task PrepareTextScriptAsync(Test test) { }
    
}