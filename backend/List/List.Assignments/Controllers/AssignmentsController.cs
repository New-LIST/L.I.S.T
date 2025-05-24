using List.Assignments.Models;
using List.Assignments.Services;
using List.Assignments.DTOs;
using List.Common.Models;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AssignmentModel>>> GetAll()
    {
        var assignments = await _assignmentService.GetAllAsync();
        return Ok(assignments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssignmentModel>> GetById(int id)
    {
        var assignment = await _assignmentService.GetByIdAsync(id);
        if (assignment == null)
            return NotFound();
        return Ok(assignment);
    }

    [HttpGet("filter")]
    public async Task<ActionResult<PagedResult<AssignmentModel>>> GetFiltered([FromQuery] AssignmentFilterDto filter)
    {
        var result = await _assignmentService.GetFilteredAsync(filter);
        return Ok(result);
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        var list = await _assignmentService.GetByCourseAsync(courseId);

        // mapovanie len na potrebné polia
        var dto = list.Select(a => new
        {
            a.Id,
            a.Name,
            taskSetTypeName = a.TaskSetType.Name,
            uploadEndTime = a.UploadEndTime
        });

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<AssignmentModel>> Create(CreateAssignmentDto dto)
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null)
            return BadRequest("Chýba identifikátor učiteľa.");
        var teacherId = int.Parse(claim.Value);

        var createdAssignment = await _assignmentService.CreateAsync(dto);
        return Ok(new { id = createdAssignment.Id, name = createdAssignment.Name });
    }

    [HttpPost("{id}/clone")]
    public async Task<ActionResult> Clone(int id)
    {
        try
        {
            var cloned = await _assignmentService.CloneAsync(id);
            return Ok(new { id = cloned.Id, name = cloned.Name });
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Zadanie s ID {id} neexistuje.");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AssignmentModel>> Update(int id, CreateAssignmentDto dto)
    {
        var assignment = await _assignmentService.UpdateAsync(id, dto);
        return assignment != null
            ? Ok(new { id = assignment.Id, name = assignment.Name })
            : BadRequest("Nepodarilo sa upraviť zadanie.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _assignmentService.DeleteAsync(id);
        return deleted != null
            ? Ok(new { id = deleted.Id, name = deleted.Name })
            : BadRequest("Nepodarilo sa vymazať zadanie.");
    }
}
