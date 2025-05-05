using List.Logs.Data;
using List.Logs.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Logs.Services;

public class LogService(LogsDbContext context) : ILogService
{
    public async Task LogAsync(string userId, string action, string target)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Target = target,
            Timestamp = DateTime.UtcNow
        };

        context.ActivityLogs.Add(log);
        await context.SaveChangesAsync();
    }
}