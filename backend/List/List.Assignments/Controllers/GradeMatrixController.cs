using List.Assignments.Models;
using List.Assignments.Services;
using List.Assignments.DTOs;
using List.Common.Models;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/gradetable/course/{courseId}")]
public class GradeMatrixController : ControllerBase
{
    private readonly IGradeMatrixService _svc;

    public GradeMatrixController(IGradeMatrixService gradeMatrixService)
    {
        _svc = gradeMatrixService;
    }

    [HttpGet]
    public async Task<ActionResult<GradeMatrixDto>> Get(int courseId)
    {
        var matrix = await _svc.GetGradeMatrixAsync(courseId);
        return Ok(matrix);
    }
}