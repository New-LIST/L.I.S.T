using List.Tasks.Models;
using List.Tasks.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using List.Tasks.DTOs;


namespace List.Tasks.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllTasks()
    {
        var tasks = await taskService.GetAllTasksAsync();

        var taskDtos = tasks.Select(t => new TaskResponseDto
        {
            Id = t.Id,
            Created = t.Created,
            Updated = t.Updated,
            Name = t.Name ?? string.Empty,
            Text = t.Text,
            InternalComment = t.InternalComment,
            AuthorId = t.AuthorId,
            AuthorFullname = t.Author?.Fullname ?? "Unknown"
        });

        return Ok(taskDtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await taskService.GetTaskAsync(id);
        if (task is null) return NotFound();

        var taskDto = new TaskResponseDto
        {
            Id = task.Id,
            Created = task.Created,
            Updated = task.Updated,
            Name = task.Name ?? string.Empty,
            Text = task.Text,
            InternalComment = task.InternalComment,
            AuthorId = task.AuthorId,
            AuthorFullname = task.Author?.Fullname ?? "Unknown"
        };

        return Ok(taskDto);
    }

    [HttpPost]
    public async Task<IActionResult> AddTask([FromBody] taskDto taskDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var task = new TaskModel
        {
            Name = taskDto.Name,
            Text = taskDto.Text,
            InternalComment = taskDto.InternalComment,
            AuthorId = int.Parse(userIdClaim),
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow
        };

        var added = await taskService.AddTaskAsync(task);
        return added ? Created() : BadRequest("Failed to add task.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] taskDto taskDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingTask = await taskService.GetTaskAsync(id);
        if (existingTask == null)
            return NotFound();

        existingTask.Name = taskDto.Name;
        existingTask.Text = taskDto.Text;
        existingTask.InternalComment = taskDto.InternalComment;
        existingTask.Updated = DateTime.UtcNow;

        var success = await taskService.UpdateTaskAsync(id, existingTask);
        return success ? Ok() : BadRequest("Failed to update task.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var success = await taskService.DeleteTaskAsync(id);
        return success ? Ok() : NotFound();
    }

}