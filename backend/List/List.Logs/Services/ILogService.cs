using List.Logs.Models;
using List.Logs.DTOs;
using List.Common.Models;

namespace List.Logs.Services;

public interface ILogService
{
    Task LogAsync(string userId, string action, string target, int targetId, string? targetName = null, string? ip = null);

    Task<PagedResult<ActivityLogDto>> GetPagedAsync(int page, int pageSize, string? filter);


    Task<IEnumerable<ActivityLogDto>> GetAllAsync();
}