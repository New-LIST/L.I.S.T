using List.Logs.Data;
using List.Logs.Models;
using List.Logs.DTOs;
using List.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Logs.Services;

public class LogService(LogsDbContext context) : ILogService
{
    public async Task LogAsync(string userId, string action, string target, int targetId, string? targetName = null, string? ip = null, string? text = null)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            // 🧠 Slovenský preklad cieľa
            string targetSk = target switch
            {
                "courses" => "kurz",
                "periods" => "obdobie",
                "course-task-set-rel" => "zostavu úloh",
                "tasks" => "úlohu",
                "assignments" => "zadanie",
                "solutions" => "riešenie",
                "users" => "používateľa",
                _ => target
            };

            // Slovenské sloveso podľa akcie
            var verb = action switch
            {
                "POST" => "vytvoril",
                "UPDATE" => "upravil",
                "DELETE" => "odstránil",
                _ => action.ToLower()
            };

            var objectName = targetName ?? "(bez názvu)";
            text = $"{userId} {verb} {targetSk} s názvom \"{objectName}\"";
        }

        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Target = target,
            TargetId = targetId,
            TargetName = targetName,
            IpAdress = ip,
            Text = text
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
                Timestamp = l.Timestamp,
                IpAdress = l.IpAdress,
                Text = l.Text
            })
            .ToListAsync();
    }

    public async Task<PagedResult<ActivityLogDto>> GetPagedAsync(
    int page, int pageSize, string? textFilter, string? userFilter)
    {
        var query = context.ActivityLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(userFilter))
        {
            var user = userFilter.ToLower();
            query = query.Where(l => l.UserId.ToLower().Contains(user));
        }
        if (!string.IsNullOrWhiteSpace(textFilter))
        {
            var text = textFilter.ToLower();
            query = query.Where(l =>
                l.Action.ToLower().Contains(text) ||
                l.Target.ToLower().Contains(text) ||
                (l.TargetName != null && l.TargetName.ToLower().Contains(text)) ||
                (l.Text != null && l.Text.ToLower().Contains(text)));
        }

        var total = await query.CountAsync();
        query = query.OrderByDescending(l => l.Timestamp);

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
                Timestamp = l.Timestamp,
                IpAdress = l.IpAdress,
                Text = l.Text
            })
            .ToListAsync();

        return new PagedResult<ActivityLogDto>
        {
            Items = items,
            TotalCount = total
        };
    }

}