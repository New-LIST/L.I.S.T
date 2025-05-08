using Microsoft.AspNetCore.Mvc;
using List.Logs.Services;
using List.Logs.DTOs;
using List.Common.Models;

namespace List.Logs.Controllers;

[ApiController]
[Route("api/logs")]
public class LogController(ILogService logService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ActivityLogDto>>> GetLogs(
    int page = 1,
    int pageSize = 100,
    string? filter = null,
    string sort = "timestamp",
    bool desc = true)
    {
        var result = await logService.GetPagedAsync(page, pageSize, filter, sort, desc);
        return Ok(result);
    }

}
