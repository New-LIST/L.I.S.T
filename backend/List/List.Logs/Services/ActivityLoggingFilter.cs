using Microsoft.AspNetCore.Mvc.Filters;

namespace List.Logs.Services;

public class ActivityLoggingFilter(ILogService logService) : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        var method = context.HttpContext.Request.Method;

        if (method != "POST" && method != "DELETE")
            return;

        var userId = context.HttpContext.User.Identity?.Name ?? "anonymous";
        var path = context.HttpContext.Request.Path;

        // fire-and-forget, nech neblokuje response
        _ = logService.LogAsync(userId, method, path);
    }
}
