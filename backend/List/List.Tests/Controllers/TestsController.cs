using List.Tests.DTOs;
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

    [HttpPost("/api/run-test")]
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

    [HttpPost]
    public async Task<ActionResult<bool>> Update(Test test, IFormFile file)
    {
        return await testService.UpdateTestAsync(test, file);
    }

    [HttpPut]
    public async Task<ActionResult<bool>> Add(Test test, IFormFile file)
    {
        return await testService.AddTestAsync(test, file);
    }

    [HttpDelete]
    public async Task<ActionResult<bool>> Delete(int id)
    {
        return await testService.DeleteTestAsync(id);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Test>> GetById(int id)
    {
        var result =  await testService.GetTestAsync(id);
        
        if (result is null)
            return NotFound();
        
        return result;
    }
}