using List.Tasks.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace List.Server.Controllers.Tasks;

[ApiController]
[Route("api/tasks/task-category")]
public class TaskCategoryRelController(ITaskCategoryRelService service) : ControllerBase
{
    private readonly ITaskCategoryRelService _service = service;

    [HttpPost]
    public async Task<IActionResult> AddRelation([FromQuery] int taskId, [FromQuery] int categoryId)
    {
        var success = await _service.AddRelationAsync(taskId, categoryId);
        return success ? Ok() : BadRequest("Relation already exists.");
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteRelation([FromQuery] int taskId, [FromQuery] int categoryId)
    {
        var success = await _service.DeleteRelationAsync(taskId, categoryId);
        return success ? NoContent() : NotFound();
    }

    [HttpGet("by-task/{taskId}")]
    public async Task<IActionResult> GetByTaskId(int taskId)
    {
        var categories = await _service.GetCategoryIdsByTaskAsync(taskId);
        return Ok(categories);
    }

    [HttpGet("by-category/{categoryId}")]
    public async Task<IActionResult> GetByCategoryId(int categoryId)
    {
        var tasks = await _service.GetTaskIdsByCategoryAsync(categoryId);
        return Ok(tasks);
    }
}
