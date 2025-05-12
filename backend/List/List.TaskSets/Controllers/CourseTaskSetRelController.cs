using List.TaskSets.Dtos;
using List.TaskSets.Services;
using List.TaskSets.Models;
using Microsoft.AspNetCore.Mvc;

namespace List.TaskSets.Controllers;

[ApiController]
[Route("api/course-task-set-rel")]
public class CourseTaskSetRelController : ControllerBase
{
    private readonly ICourseTaskSetRelService _service;

    public CourseTaskSetRelController(ICourseTaskSetRelService service)
    {
        _service = service;
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
        var rels = await _service.GetByCourseIdAsync(courseId);
        return Ok(rels);
    }

    [HttpPost]
    public async Task<ActionResult<CourseTaskSetRelDto>> Create(CourseTaskSetRelDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return created != null
        ? Ok(new { id = created.Id, name = $"Zostava v course s id = {created.CourseId} s task_set_type_id = {created.TaskSetTypeId}" })
        : NotFound();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CourseTaskSetRelDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch");

        var updated = await _service.UpdateAsync(id, dto);
        return updated != null
            ? Ok(new { id = updated.Id, name = $"Zostava v course s id = {updated.CourseId} s task_set_type_id = {updated.TaskSetTypeId}" })
            : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted != null
            ? Ok(new { id = deleted.Id, name = $"Zostava v course s id = {deleted.CourseId} s task_set_type_id = {deleted.TaskSetTypeId}" })
            : NotFound();
    }

    [HttpGet("{id}/dependent-count")]
    public async Task<IActionResult> GetDependentCount(int id)
    {
        var count = await _service.GetDependentCountAsync(id);
        if (count == null)
            return NotFound();

        return Ok(count);
    }

    [HttpGet("{courseId}/types")]
    public async Task<ActionResult<IEnumerable<TaskSetType>>> GetTypesForCourse(int courseId)
    {
        var types = await _service.GetTypesForCourseAsync(courseId);
        return Ok(types);
    }

}
