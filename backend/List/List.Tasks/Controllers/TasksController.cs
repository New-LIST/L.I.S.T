using List.Tasks.Models;
using List.Tasks.Services;
using Microsoft.AspNetCore.Mvc;

namespace List.Tasks.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllTasks()
    {
        var tasks = await taskService.GetAllTasksAsync();
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await taskService.GetTaskAsync(id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> AddTask([FromBody] TaskModel task)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        task.Id = 0;
        var now = DateTime.UtcNow;
        task.Created = now;
        task.Updated = now;

        var added = await taskService.AddTaskAsync(task);
        return added ? Created() : BadRequest("Failed to add task.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskModel updatedTask)
    {
        var success = await taskService.UpdateTaskAsync(id, updatedTask);
        return success ? Ok() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var success = await taskService.DeleteTaskAsync(id);
        return success ? Ok() : NotFound();
    }

}