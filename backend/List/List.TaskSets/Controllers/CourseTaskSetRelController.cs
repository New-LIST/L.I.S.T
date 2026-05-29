using List.TaskSets.Dtos;
using List.TaskSets.Services;
using List.TaskSets.Models;
using List.Users.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace List.TaskSets.Controllers;

[ApiController]
[Route("api/course-task-set-rel")]
public class CourseTaskSetRelController : ControllerBase
{
    private readonly ICourseTaskSetRelService _service;
    private readonly IAssistantPermissionService _assistantPermissions;

    public CourseTaskSetRelController(
        ICourseTaskSetRelService service,
        IAssistantPermissionService assistantPermissions)
    {
        _service = service;
        _assistantPermissions = assistantPermissions;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseTaskSetRelDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseTaskSetRelDto>> GetById(int id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpGet("by-course/{courseId}")]
    public async Task<IActionResult> GetByCourseId(int courseId)
    {
        if (!await CanViewOrManageCourseAsync(courseId))
            return Forbid();

        var rels = await _service.GetByCourseIdAsync(courseId);
        return Ok(rels);
    }

    [HttpPost]
    public async Task<ActionResult<CourseTaskSetRelDto>> Create(CourseTaskSetRelDto dto)
    {
        if (!await CanManageCourseAsync(dto.CourseId))
            return Forbid();

        var created = await _service.CreateAsync(dto);
        return created != null
        ? Ok()
        : NotFound();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CourseTaskSetRelDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch");

        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        if (!await CanManageCourseAsync(existing.CourseId) || !await CanManageCourseAsync(dto.CourseId))
            return Forbid();

        var updated = await _service.UpdateAsync(id, dto);
        return updated != null
            ? Ok()
            : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        if (!await CanManageCourseAsync(existing.CourseId))
            return Forbid();

        var deleted = await _service.DeleteAsync(id);
        return deleted != null
            ? Ok()
            : NotFound();
    }

    [HttpGet("{id}/dependent-count")]
    public async Task<IActionResult> GetDependentCount(int id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        if (!await CanManageCourseAsync(existing.CourseId))
            return Forbid();

        var count = await _service.GetDependentCountAsync(id);
        if (count == null)
            return NotFound();

        return Ok(count);
    }

    [HttpGet("{courseId}/types")]
    public async Task<ActionResult<IEnumerable<TaskSetType>>> GetTypesForCourse(int courseId)
    {
        if (!await CanViewOrManageCourseAsync(courseId))
            return Forbid();

        var types = await _service.GetTypesForCourseAsync(courseId);
        return Ok(types);
    }

    private async Task<bool> CanViewOrManageCourseAsync(int courseId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        var userId = GetCurrentUserId();
        return await _assistantPermissions.CanViewCourseContentAsync(userId, courseId) ||
            await _assistantPermissions.CanManageCourseContentAsync(userId, courseId);
    }

    private async Task<bool> CanManageCourseAsync(int courseId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        return await _assistantPermissions.CanManageCourseContentAsync(GetCurrentUserId(), courseId);
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

}
