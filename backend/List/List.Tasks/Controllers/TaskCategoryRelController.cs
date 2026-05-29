using List.Tasks.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using List.Users.Services;
using System.Security.Claims;

namespace List.Server.Controllers.Tasks;

[ApiController]
[Route("api/tasks/task-category")]
public class TaskCategoryRelController(
    ITaskCategoryRelService service,
    IAssistantPermissionService assistantPermissions) : ControllerBase
{
    private readonly ITaskCategoryRelService _service = service;

    [HttpPost]
    public async Task<IActionResult> AddRelation([FromQuery] int taskId, [FromQuery] int categoryId)
    {
        if (!await CanManageTaskBankAsync())
            return Forbid();

        var success = await _service.AddRelationAsync(taskId, categoryId);
        return success ? Ok() : BadRequest("Relation already exists.");
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteRelation([FromQuery] int taskId, [FromQuery] int categoryId)
    {
        if (!await CanManageTaskBankAsync())
            return Forbid();

        var success = await _service.DeleteRelationAsync(taskId, categoryId);
        return success ? NoContent() : NotFound();
    }

    [HttpGet("by-task/{taskId}")]
    public async Task<IActionResult> GetByTaskId(int taskId)
    {
        if (!await CanReadTaskBankAsync())
            return Forbid();

        var categories = await _service.GetCategoryIdsByTaskAsync(taskId);
        return Ok(categories);
    }

    [HttpGet("by-category/{categoryId}")]
    public async Task<IActionResult> GetByCategoryId(int categoryId)
    {
        if (!await CanReadTaskBankAsync())
            return Forbid();

        var tasks = await _service.GetTaskIdsByCategoryAsync(categoryId);
        return Ok(tasks);
    }

    private async Task<bool> CanReadTaskBankAsync()
    {
        if (!User.IsInRole("Assistant"))
            return true;

        return await assistantPermissions.HasAnyPermissionAsync(GetCurrentUserId());
    }

    private async Task<bool> CanManageTaskBankAsync()
    {
        if (!User.IsInRole("Assistant"))
            return true;

        return await assistantPermissions.HasAnyManageCourseContentAsync(GetCurrentUserId());
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }
}
