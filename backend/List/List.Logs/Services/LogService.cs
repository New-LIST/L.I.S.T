using List.Logs.Data;
using List.Logs.Models;
using List.Logs.DTOs;
using List.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Logs.Services;

public class LogService(LogsDbContext context) : ILogService
{
    public async Task LogAsync(string userId, string action, string target, int targetId, string? targetName = null)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Target = target,
            TargetId = targetId,
            Timestamp = DateTime.UtcNow,
            TargetName = targetName
        };

        context.ActivityLogs.Add(log);
        await context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ActivityLogDto>> GetAllAsync()
    {
        return await context.ActivityLogs
            .OrderByDescending(l => l.Timestamp)
            .Select(l => new ActivityLogDto
            {
                UserId = l.UserId,
                Action = l.Action,
                Target = l.Target,
                TargetId = l.TargetId,
                TargetName = l.TargetName,
                Timestamp = l.Timestamp
            })
            .ToListAsync();
    }

   public async Task<PagedResult<ActivityLogDto>> GetPagedAsync(int page, int pageSize, string? filter)
{
    var query = context.ActivityLogs.AsQueryable();

    if (!string.IsNullOrWhiteSpace(filter))
    {
        filter = filter.ToLower();
        query = query.Where(l =>
            l.UserId.ToLower().Contains(filter) ||
            l.Action.ToLower().Contains(filter) ||
            l.Target.ToLower().Contains(filter) ||
            (l.TargetName != null && l.TargetName.ToLower().Contains(filter)));
    }

    var total = await query.CountAsync();

    query = query.OrderByDescending(l => l.Timestamp); // pevné radenie

    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(l => new ActivityLogDto
        {
            UserId = l.UserId,
            Action = l.Action,
            Target = l.Target,
            TargetId = l.TargetId,
            TargetName = l.TargetName,
            Timestamp = l.Timestamp
        })
        .ToListAsync();

    return new PagedResult<ActivityLogDto>
    {
        Items = items,
        TotalCount = total
    };
}


}