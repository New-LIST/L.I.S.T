using Microsoft.AspNetCore.Mvc;
using List.Logs.Services;

namespace List.Logs.Controllers;

[ApiController]
[Route("api/logs")]
public class LogController(ILogService logService) : ControllerBase
{
    // Napr. endpoint pre výpis logov v budúcnosti
}
