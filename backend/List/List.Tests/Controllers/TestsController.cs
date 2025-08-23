using System.Data;
using List.Common.Models;
using List.Tests.DTOs;
using List.Tests.Models;
using List.Tests.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace List.Tests.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestService testService, IPrepareScriptService prepareScriptService) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<Test>> GetTestsPageAsync(int page = 0, int pageSize = 100)
    {
        return await testService.GetTestsByAsync(page, pageSize);
    }

    [HttpPost("/api/run-test")]
    public async Task<ActionResult<TestResult>> RunTest(Test test, IFormFile file)
    {
        var result = await testService.AddTestAsync(test);

        if (!result)
        {
            return BadRequest();
        }
        
        var testResult = await prepareScriptService.PrepareScriptAsync(test);
        
        return testResult;
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost("/api/tasks/{taskId:int}/tests/{testId:int}")]
    public async Task<ActionResult<bool>> Update(int taskId, int testId, TestDto test)
    {
        var testToUpdate = await testService.GetTestAsync(testId);
        
        if (testToUpdate is null)
            return NotFound();;
        
        testToUpdate.Name = test.Name;
        testToUpdate.Timeout = test.Timeout;
        testToUpdate.Type = test.Type;
        testToUpdate.Allowed = test.Allowed;
        testToUpdate.Evaluate = test.Evaluate;
        testToUpdate.TaskId = taskId;
        var result =  await testService.UpdateTestAsync(testToUpdate);
        if (result)
            return Ok();
        return BadRequest();
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("/api/tasks/{taskId:int}/tests")]
    public async Task<ActionResult<bool>> Add(int taskId, TestDto test)
    {
        var newTest = new Test()
        {
            Name = test.Name,
            Timeout = test.Timeout,
            Type = test.Type,
            TaskId = taskId,
            Allowed = test.Allowed,
            Evaluate = test.Evaluate,
            StorageKey = Guid.NewGuid().ToString(),
        };
        return await testService.AddTestAsync(newTest);
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{id:int}")]

    public async Task<ActionResult<bool>> Delete(int id)
    {
        return await testService.DeleteTestAsync(id);
    }
    
    [Authorize(Roles = "Teacher")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Test>> GetById(int id)
    {
        var result =  await testService.GetTestAsync(id);
        
        if (result is null)
            return NotFound();
        
        return result;
    }
}