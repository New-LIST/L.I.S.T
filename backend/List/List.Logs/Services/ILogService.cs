using List.Logs.Models;
using List.Logs.DTOs;
using List.Common.Models;

namespace List.Logs.Services;

public interface ILogService
{
    Task LogAsync(string userId, string action, string target, int targetId, string? targetName = null, string? ip = null, string? text = null);

    Task<PagedResult<ActivityLogDto>> GetPagedAsync(int page, int pageSize, string? textFilter, string? userFilter);


    Task<IEnumerable<ActivityLogDto>> GetAllAsync();
}