using List.Assignments.Models;
using List.Assignments.Services;
using List.Assignments.DTOs;
using List.Common.Models;
using List.Users.Services;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/gradetable/course/{courseId}")]
public class GradeMatrixController : ControllerBase
{
    private readonly IGradeMatrixService _svc;
    private readonly IAssistantPermissionService _assistantPermissions;

    public GradeMatrixController(
        IGradeMatrixService gradeMatrixService,
        IAssistantPermissionService assistantPermissions)
    {
        _svc = gradeMatrixService;
        _assistantPermissions = assistantPermissions;
    }

    [HttpGet]
    public async Task<ActionResult<GradeMatrixDto>> Get(int courseId)
    {
        if (User.IsInRole("Assistant"))
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (!await _assistantPermissions.CanGradeCourseAsync(userId, courseId))
                return Forbid();
        }

        var matrix = await _svc.GetGradeMatrixAsync(courseId);
        return Ok(matrix);
    }
}
