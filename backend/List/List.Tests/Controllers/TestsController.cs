using List.Tests.Models;
using List.Tests.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace List.Tests.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestService testService, IPrepareScriptService prepareScriptService) : ControllerBase
{
    [HttpGet]
    public async Task<List<Test>> GetAllAsync()
    {
        return (await testService.GetTestsAsync()).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<TestResult>> RunTest(Test test, IFormFile file)
    {
        var result = await testService.AddTestAsync(test, file);

        if (!result)
        {
            return BadRequest();
        }
        
        var testResult = await prepareScriptService.PrepareScriptAsync(test);
        
        return testResult;
    }
}