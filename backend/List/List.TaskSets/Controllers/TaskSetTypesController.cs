using List.TaskSets.Dtos;
using List.TaskSets.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Npgsql;


namespace List.TaskSets.Controllers;

[ApiController]
[Route("api/task-set-types")]
public class TaskSetTypesController : ControllerBase
{
    private readonly ITaskSetTypeService _service;

    public TaskSetTypesController(ITaskSetTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _service.GetAllAsync();
        return Ok(types);
    }

    [HttpGet("identifiers/by-course/{courseId}")]
    public async Task<IActionResult> GetIdentifiersByCourse(int courseId)
    {
        var identifiers = await _service.GetIdentifiersByCourseIdAsync(courseId);
        return Ok(identifiers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskSetTypeDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto);
            return Ok(new { id = created.Id, name = created.Name });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TaskSetTypeDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID in route does not match DTO.");

        try
        {
            var updated = await _service.UpdateAsync(dto);
            return updated != null
                ? Ok(new { id = updated.Id, name = updated.Name })
                : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted != null
            ? Ok(new { id = deleted.Id, name = deleted.Name })
            : NotFound();
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException pgEx &&
               pgEx.SqlState == "23505"; // 23505 = unique_violation
    }
}

