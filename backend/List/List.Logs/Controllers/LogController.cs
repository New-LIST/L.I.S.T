using Microsoft.AspNetCore.Mvc;
using List.Logs.Services;
using List.Logs.DTOs;

namespace List.Logs.Controllers;

[ApiController]
[Route("api/logs")]
public class LogController(ILogService logService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLogDto>>> GetLogs()
    {
        var logs = await logService.GetAllAsync();
        return Ok(logs);
    }
}
