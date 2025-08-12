using List.Common.Files;
using List.Tests.Data;
using List.Tests.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List.Tests.Services;

public class TestService(TestsDbContext context, IFileStorageService storageService) : ITestService
{
    public async Task<IEnumerable<Test>> GetTestsAsync()
    {
        return await context.Tests.ToListAsync();
    }

    public async Task<Test?> GetTestAsync(int id)
    {
        return await context.Tests.FirstOrDefaultAsync(x => x.Id == id);
    }
    
    public async Task<bool> AddTestAsync(Test test, IFormFile file)
    {
        await storageService.SaveFileAsync(file, $"Tests/{test.Name}");
        
        await context.Tests.AddAsync(test);
        
        await context.SaveChangesAsync();
        
        return true;
    }

    public async Task<bool> UpdateTestAsync(Test test, IFormFile file)
    {
        try
        {
            await storageService.DeleteFileAsync(test.StorageKey);
            
            await storageService.SaveFileAsync(file, $"Tests/{test.StorageKey}");

            context.Tests.Update(test);
        
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return false;
        }
        return true;
    }
    
    public async Task<bool> DeleteTestAsync(int id)
    {
        try
        {
            var test = await GetTestAsync(id);
            if (test is null)
                return false;
            await storageService.DeleteFileAsync(test.StorageKey);
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return false;
        }
        return true;
    }
}