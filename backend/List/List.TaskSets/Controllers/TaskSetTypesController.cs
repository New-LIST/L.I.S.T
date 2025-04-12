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
        Console.WriteLine("TaskSetTypesController loaded");
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
            return Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (DbUpdateException dbEx) when (IsUniqueConstraintViolation(dbEx))
        {
            return Conflict(new { message = "Name or identifier already exists." });
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
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (DbUpdateException dbEx) when (IsUniqueConstraintViolation(dbEx))
        {
            return Conflict(new { message = "Name or identifier already exists." });
        }
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException pgEx &&
               pgEx.SqlState == "23505"; // 23505 = unique_violation
    }
}

