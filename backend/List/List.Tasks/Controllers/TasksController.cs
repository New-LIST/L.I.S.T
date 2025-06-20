using List.Tasks.Models;
using List.Tasks.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using List.Tasks.DTOs;
using List.Common.Files;


namespace List.Tasks.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(ITaskService taskService, ITaskCategoryRelService relService) : ControllerBase
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

    [HttpGet("filter")]
    public async Task<IActionResult> FilterTasks([FromQuery] string? name, [FromQuery] string? author, [FromQuery] string? categoryFilter)
    {
        var tasks = await taskService.FilterTasksAsync(name, author, categoryFilter);

        var taskDtos = tasks.Select(t => new TaskResponseDto
        {
            Id = t.Id,
            Name = t.Name ?? string.Empty,
            Text = t.Text,
            InternalComment = t.InternalComment,
            Created = t.Created,
            Updated = t.Updated,
            AuthorFullname = t.Author?.Fullname ?? "Unknown"
        });


        return Ok(taskDtos);
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

        var result = await taskService.AddTaskAsync(task);
        return result != null
            ? Ok(new { id = result.Id, name = result.Name })
            : BadRequest("Failed to add task.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] taskDto taskDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updatedTask = new TaskModel
        {
            Name = taskDto.Name,
            Text = taskDto.Text,
            InternalComment = taskDto.InternalComment
        };

        var result = await taskService.UpdateTaskAsync(id, updatedTask);

        if (result == null)
            return NotFound();

        return Ok(new { id = result.Id, name = result.Name });
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var deleted = await taskService.DeleteTaskAsync(id);
        return deleted != null
            ? Ok(new { id = deleted.Id, name = deleted.Name })
            : NotFound();
    }

    [HttpPost("upload-image")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromServices] IFileStorageService fileStorageService)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var relativePath = await fileStorageService.SaveFileAsync(file, "tasks"); // saves to /uploads/tasks
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var url = $"{baseUrl}/{relativePath.Replace("\\", "/")}";

        return Ok(new { location = url });
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> DuplicateTask(int id)
    {
        var original = await taskService.GetTaskAsync(id);
        if (original == null) return NotFound();

        var duplicated = new TaskModel
        {
            Name = original.Name + " (kópia)",
            Text = original.Text,
            InternalComment = original.InternalComment,
            AuthorId = original.AuthorId,
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow,
            ParentTaskId = original.ParentTaskId ?? original.Id
        };

        var result = await taskService.AddTaskAsync(duplicated);
        if (result == null)
            return BadRequest("Nepodarilo sa vytvoriť kópiu.");


        var originalCategories = await relService.GetCategoryIdsByTaskAsync(original.Id);
        foreach (var categoryId in originalCategories)
        {
            await relService.AddRelationAsync(result.Id, categoryId);
        }

        return Ok(new { id = result.Id, name = result.Name });
    }




}