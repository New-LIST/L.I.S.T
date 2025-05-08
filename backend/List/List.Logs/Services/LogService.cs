using List.Logs.Data;
using List.Logs.Models;
using List.Logs.DTOs;
using List.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Logs.Services;

public class LogService(LogsDbContext context) : ILogService
{
    public async Task LogAsync(string userId, string action, string target, int targetId)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Target = target,
            TargetId = targetId,
            Timestamp = DateTime.UtcNow
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
                Timestamp = l.Timestamp
            })
            .ToListAsync();
    }

    public async Task<PagedResult<ActivityLogDto>> GetPagedAsync(int page, int pageSize, string? filter, string sort, bool desc)
    {
        var query = context.ActivityLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter))
        {
            filter = filter.ToLower();
            query = query.Where(l =>
                l.UserId.ToLower().Contains(filter) ||
                l.Action.ToLower().Contains(filter) ||
                l.Target.ToLower().Contains(filter));
        }

        var total = await query.CountAsync();

        query = sort.ToLower() switch
        {
            "user" => desc ? query.OrderByDescending(l => l.UserId) : query.OrderBy(l => l.UserId),
            "action" => desc ? query.OrderByDescending(l => l.Action) : query.OrderBy(l => l.Action),
            "target" => desc ? query.OrderByDescending(l => l.Target) : query.OrderBy(l => l.Target),
            "targetid" => desc ? query.OrderByDescending(l => l.TargetId) : query.OrderBy(l => l.TargetId),
            _ => desc ? query.OrderByDescending(l => l.Timestamp) : query.OrderBy(l => l.Timestamp),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new ActivityLogDto
            {
                UserId = l.UserId,
                Action = l.Action,
                Target = l.Target,
                TargetId = l.TargetId,
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