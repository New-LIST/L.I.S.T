using List.Common.Files;
using List.Common.Models;
using List.Tests.Data;
using List.Tests.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List.Tests.Services;

public class TestService(TestsDbContext context, IFileStorageService storageService) : ITestService
{
    public async Task<PagedResult<Test>> GetTestsByAsync(int page, int pageSize)
    {
        return new()
        {
            Items = await context.Tests.Skip((page) * pageSize).Take(pageSize).ToListAsync(),
            TotalCount = await context.Tests.CountAsync()
        };
    }

    public async Task<IEnumerable<Test>> GetTestsAsync()
    {
        return await context.Tests.ToListAsync();
    }

    public async Task<Test?> GetTestAsync(int id)
    {
        return await context.Tests.FirstOrDefaultAsync(x => x.Id == id);
    }
    
    public async Task<bool> AddTestAsync(Test test)
    {
        await context.Tests.AddAsync(test);
        
        await context.SaveChangesAsync();
        
        return true;
    }

    public async Task<bool> UpdateTestAsync(Test test)
    {
        try
        {
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
            context.Tests.Remove(test);
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return false;
        }
        return true;
    }
}