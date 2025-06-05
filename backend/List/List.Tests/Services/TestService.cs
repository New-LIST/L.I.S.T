using List.Common.Files;
using List.Tests.Data;
using List.Tests.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace List.Tests.Services;

public class TestService(TestsDbContext context, IFileStorageService storageService) : ITestService
{
    public async Task<IEnumerable<Test>> GetTestsAsync()
    {
        return await context.Tests.ToListAsync();
    }
    
    public Task<bool> AddTestAsync(Test test, IFormFile file)
    {
        storageService.SaveFileAsync(file, $"Tests/{test.Name}");
        
        return Task.FromResult(true);
    }
    
    
}