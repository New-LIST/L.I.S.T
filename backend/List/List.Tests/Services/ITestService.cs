using List.Common.Models;
using List.Tests.Models;
using Microsoft.AspNetCore.Http;

namespace List.Tests.Services;

public interface ITestService
{
    public Task<PagedResult<Test>> GetTestsByAsync(int page, int pageSize);
    public Task<IEnumerable<Test>> GetTestsAsync();
    public Task<bool> AddTestAsync(Test test);
    public Task<bool> UpdateTestAsync(Test test);
    public Task<Test?> GetTestAsync(int id);
    public Task<bool> DeleteTestAsync(int id);
}