using List.Tests.Models;
using Microsoft.AspNetCore.Http;

namespace List.Tests.Services;

public interface ITestService
{
    public Task<IEnumerable<Test>> GetTestsAsync();
    public Task<bool> AddTestAsync(Test test, IFormFile file);
    public Task<bool> UpdateTestAsync(Test test, IFormFile file);
    public Task<Test?> GetTestAsync(int id);
    public Task<bool> DeleteTestAsync(int id);
}