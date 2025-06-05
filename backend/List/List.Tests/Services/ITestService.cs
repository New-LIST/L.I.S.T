using List.Tests.Models;
using Microsoft.AspNetCore.Http;

namespace List.Tests.Services;

public interface ITestService
{
    public Task<IEnumerable<Test>> GetTestsAsync();
    public Task<bool> AddTestAsync(Test test, IFormFile file);
}