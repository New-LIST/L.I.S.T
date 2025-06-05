using List.Tests.Models;
using List.Tests.Services;
using Microsoft.AspNetCore.Mvc;

namespace List.Tests.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestService testService) : ControllerBase
{
    [HttpGet]
    public async Task<List<Test>> GetAllAsync()
    {
        return (await testService.GetTestsAsync()).ToList();
    }
}