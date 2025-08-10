using List.DataMigration.Data;
using Microsoft.EntityFrameworkCore;

namespace List.DataMigration.Services;

public class MigrateDataService(NewListDbContext newListDbContext, OldListDbContext oldListDbContext)
{
    public async Task<bool> MigrateData()
    {
        try
        {
            var newPeriods = await oldListDbContext.Periods.Select(period => period.ToNew()).ToListAsync();
            await newListDbContext.Periods.AddRangeAsync(newPeriods);
            
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            
            return false;
        }
        
        return true;
    }
}