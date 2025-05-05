using List.Logs.Models;

namespace List.Logs.Services;

public interface ILogService
{
    Task LogAsync(string userId, string action, string target);
}