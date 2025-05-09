using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using List.Logs.Services;
using System.Reflection;
using System.Text.Json;

namespace List.Logs.Services;

public class ActivityLoggingFilter : IActionFilter
{
    private readonly ILogService _logService;

    public ActivityLoggingFilter(ILogService logService)
    {
        _logService = logService;
    }

    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        Console.WriteLine("🔥 ActivityLoggingFilter: OnActionExecuted called");

        var method = context.HttpContext.Request.Method;
        Console.WriteLine($"🔥 HTTP Method: {method}");
        if (method != "POST" && method != "PUT" && method != "DELETE") return;

        if (context.Result is not ObjectResult result || result.Value is null) return;

        var type = result.Value.GetType();
        var idProp = type.GetProperty("Id", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
        var nameProp = type.GetProperty("Name", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
        if (idProp == null || nameProp == null) return;
        var id = (int?)idProp.GetValue(result.Value);
        var name = nameProp.GetValue(result.Value)?.ToString();

        if (id is null || string.IsNullOrEmpty(name)) return;

        var userId = context.HttpContext.User.Identity?.Name ?? "anonymous";
        var ip = context.HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
              ?? context.HttpContext.Connection.RemoteIpAddress?.ToString();


        var pathSegments = context.HttpContext.Request.Path.ToString().ToLower().Split('/');
        var target = pathSegments.LastOrDefault(s => !string.IsNullOrWhiteSpace(s) && !int.TryParse(s, out _)) ?? "unknown";

        _ = _logService.LogAsync(userId, method == "PUT" ? "UPDATE" : method, target, id.Value, name, ip);
    }
}
