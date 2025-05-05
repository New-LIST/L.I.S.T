using List.Logs.Models;
using List.Logs.DTOs;

namespace List.Logs.Services;

public interface ILogService
{
    Task LogAsync(string userId, string action, string target);
    Task<IEnumerable<ActivityLogDto>> GetAllAsync();
}