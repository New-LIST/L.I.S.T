using List.Assignments.Models;
using List.Assignments.Services;
using List.Assignments.DTOs;
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

    [HttpPost]
    public async Task<ActionResult<AssignmentModel>> Create(CreateAssignmentDto dto)
    {
        var createdAssignment = await _assignmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = createdAssignment.Id }, createdAssignment);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AssignmentModel>> Update(int id, CreateAssignmentDto dto)
    {
        var assignment = await _assignmentService.UpdateAsync(id, dto);
        if (assignment == null)
            return NotFound();
        return Ok(assignment);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _assignmentService.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
