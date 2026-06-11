using List.Assignments.DTOs;
using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.Services;
using List.Users.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;  // pre DbUpdateException
using Npgsql;
using System.Security.Claims;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/assignment-task-rel")]
public class AssignmentTaskRelController : ControllerBase
{
    private readonly IAssignmentTaskRelService _service;
    private readonly AssignmentsDbContext _db;
    private readonly IAssistantPermissionService _assistantPermissions;

    public AssignmentTaskRelController(
        IAssignmentTaskRelService service,
        AssignmentsDbContext db,
        IAssistantPermissionService assistantPermissions)
    {
        _service = service;
        _db = db;
        _assistantPermissions = assistantPermissions;
    }

    [HttpPost]
    public async Task<ActionResult<AssignmentTaskRelModel>> Create(CreateAssignmentTaskRelDto dto)
    {
        if (!await CanManageAssignmentAsync(dto.AssignmentId))
            return Forbid();

        try
        {
            var created = await _service.CreateAsync(dto);
            return Ok(created);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pg
                  && pg.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            // unikátna dvojica (assignmentId, taskId) už existuje
            return Conflict("Táto úloha sa už nachádza v tejto zostave.");
        }
    }

    [HttpPut]
        public async Task<ActionResult<AssignmentTaskRelModel>> Update(CreateAssignmentTaskRelDto dto)
        {
            if (!await CanManageAssignmentAsync(dto.AssignmentId))
                return Forbid();

            var updated = await _service.UpdateAsync(dto);
            if (updated == null)
                return NotFound($"Vzťah assignment={dto.AssignmentId} + task={dto.TaskId} neexistuje.");
            return Ok(updated);
        }

    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] int assignmentId, [FromQuery] int taskId)
    {
        if (!await CanManageAssignmentAsync(assignmentId))
            return Forbid();

        var deleted = await _service.DeleteAsync(taskId, assignmentId);
        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<List<AssignmentTaskRelModel>>> GetAll()
    {
        var rels = await _service.GetAllAsync();
        return Ok(rels);
    }

    [HttpGet("by-assignment-slim/{assignmentId}")]
    public async Task<ActionResult<List<AssignmentTaskRelSlimDto>>> GetSlimByAssignmentId(int assignmentId)
    {
        var list = await _service.GetSlimByAssignmentIdAsync(assignmentId);
        return Ok(list);
    }

    [HttpGet("by-assignment/{assignmentId}")]
    public async Task<ActionResult<List<AssignmentTaskRelModel>>> GetByAssignmentId(int assignmentId)
    {
        var rels = await _service.GetByAssignmentIdAsync(assignmentId);
        return Ok(rels);
    }

    [HttpGet("by-task/{taskId}")]
    public async Task<ActionResult<List<AssignmentTaskRelModel>>> GetByTaskId(int taskId)
    {
        var rels = await _service.GetByTaskIdAsync(taskId);
        return Ok(rels);
    }

    private async Task<bool> CanManageAssignmentAsync(int assignmentId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return false;

        var courseId = await _db.Assignments
            .AsNoTracking()
            .Where(a => a.Id == assignmentId)
            .Select(a => (int?)a.CourseId)
            .FirstOrDefaultAsync();

        return courseId.HasValue &&
            await _assistantPermissions.CanManageCourseContentAsync(int.Parse(userIdClaim), courseId.Value);
    }
}
