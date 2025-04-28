using List.Assignments.DTOs;
using List.Assignments.Models;
using List.Assignments.Services;
using Microsoft.AspNetCore.Mvc;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/assignment-task-rel")]
public class AssignmentTaskRelController : ControllerBase
{
    private readonly IAssignmentTaskRelService _service;

    public AssignmentTaskRelController(IAssignmentTaskRelService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<AssignmentTaskRelModel>> Create(CreateAssignmentTaskRelDto dto)
    {
        var createdRel = await _service.CreateAsync(dto);
        return Ok(createdRel);
    }

    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] int assignmentId, [FromQuery] int taskId)
    {
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
}
