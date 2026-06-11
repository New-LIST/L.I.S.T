using System.Security.Claims;
using List.Assignments.Data;
using List.Assignments.DTOs;
using List.Assignments.Models;
using List.Assignments.Services;
using List.Common.Files;
using List.Common.Models;
using List.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List.Assignments.Controllers;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly AssignmentsDbContext _db;
    private readonly IAssistantPermissionService _assistantPermissions;

    public AssignmentsController(
        IAssignmentService assignmentService,
        AssignmentsDbContext db,
        IAssistantPermissionService assistantPermissions)
    {
        _assignmentService = assignmentService;
        _db = db;
        _assistantPermissions = assistantPermissions;
    }

    [HttpGet]
    public async Task<ActionResult<List<AssignmentModel>>> GetAll()
    {
        var assignments = await _assignmentService.GetAllAsync(await GetAssistantAllowedCourseIdsOrNullAsync());
        return Ok(assignments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssignmentModel>> GetById(int id)
    {
        var assignment = await _assignmentService.GetByIdAsync(id);
        if (assignment == null)
            return NotFound();

        if (!await CanReadCourseContentAsync(assignment.CourseId) &&
            !await CanManageCourseContentAsync(assignment.CourseId) &&
            !await CanGradeCourseAsync(assignment.CourseId))
            return Forbid();

        return Ok(assignment);
    }

    [HttpGet("filter")]
    public async Task<ActionResult<PagedResult<AssignmentModel>>> GetFiltered([FromQuery] AssignmentFilterDto filter)
    {
        var result = await _assignmentService.GetFilteredAsync(filter, await GetAssistantAllowedCourseIdsOrNullAsync());
        return Ok(result);
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        if (!await CanReadCourseContentAsync(courseId) &&
            !await CanManageCourseContentAsync(courseId) &&
            !await CanGradeCourseAsync(courseId))
            return Forbid();

        var list = await _assignmentService.GetByCourseAsync(courseId);

        var dto = list.Select(a => new
        {
            a.Id,
            a.Name,
            taskSetTypeId = a.TaskSetType.Id,
            taskSetTypeName = a.TaskSetType.Name,
            taskSetTypeIdentifier = a.TaskSetType.Identifier,
            publishStartTime = a.PublishStartTime,
            uploadEndTime = a.UploadEndTime,
            pointsOverride = a.PointsOverride,
            published = a.Published
        });

        return Ok(dto);
    }

    [HttpGet("course/{courseId}/student-visible")]
    public async Task<IActionResult> GetVisibleByCourseForStudent(int courseId)
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null)
            return BadRequest("Chyba identifikator pouzivatela.");

        var studentId = int.Parse(claim.Value);
        return Ok(await _assignmentService.GetVisibleByCourseForStudentAsync(courseId, studentId));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<AssignmentModel>> Create(CreateAssignmentDto dto)
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null)
            return BadRequest("Chyba identifikator ucitela.");

        if (!await CanManageCourseContentAsync(dto.CourseId))
            return Forbid();

        var teacherId = int.Parse(claim.Value);

        try
        {
            var createdAssignment = await _assignmentService.CreateAsync(dto, teacherId);
            return Ok(new { id = createdAssignment.Id, name = createdAssignment.Name });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/clone")]
    [Authorize]
    public async Task<ActionResult> Clone(int id)
    {
        try
        {
            var courseId = await GetAssignmentCourseIdAsync(id);
            if (!courseId.HasValue)
                return NotFound($"Zadanie s ID {id} neexistuje.");

            if (!await CanManageCourseContentAsync(courseId.Value))
                return Forbid();

            var cloned = await _assignmentService.CloneAsync(id);
            return Ok(new { id = cloned.Id, name = cloned.Name });
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Zadanie s ID {id} neexistuje.");
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<AssignmentModel>> Update(int id, CreateAssignmentDto dto)
    {
        try
        {
            var currentCourseId = await GetAssignmentCourseIdAsync(id);
            if (!currentCourseId.HasValue)
                return NotFound();

            if (!await CanManageCourseContentAsync(currentCourseId.Value) ||
                !await CanManageCourseContentAsync(dto.CourseId))
                return Forbid();

            var assignment = await _assignmentService.UpdateAsync(id, dto);
            return assignment != null
                ? Ok(new { id = assignment.Id, name = assignment.Name })
                : BadRequest("Nepodarilo sa upravit zadanie.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        var courseId = await GetAssignmentCourseIdAsync(id);
        if (!courseId.HasValue)
            return NotFound();

        if (!await CanManageCourseContentAsync(courseId.Value))
            return Forbid();

        var deleted = await _assignmentService.DeleteAsync(id);
        return deleted != null
            ? Ok(new { id = deleted.Id, name = deleted.Name })
            : BadRequest("Nepodarilo sa vymazat zadanie.");
    }

    [HttpGet("{assignmentId}/assignmentName")]
    public async Task<IActionResult> GetAssignmentName(int assignmentId)
    {
        var courseId = await GetAssignmentCourseIdAsync(assignmentId);
        if (courseId.HasValue && !await CanGradeCourseAsync(courseId.Value))
            return Forbid();

        var dto = await _assignmentService.GetAssignmentNameAsync(assignmentId);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpGet("{id}/canUpload")]
    public async Task<IActionResult> CanUpload(int id)
    {
        var assignment = await _assignmentService.GetByIdAsync(id);
        if (assignment == null)
            return NotFound($"Zadanie s ID {id} neexistuje.");

        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null)
            return BadRequest("Chyba identifikator pouzivatela.");

        var canUpload = await _assignmentService.CanUploadSolutionAsync(id, int.Parse(claim.Value));
        return Ok(new { canUpload });
    }

    [HttpGet("{id}/maxpoints")]
    public async Task<IActionResult> CountMaxPoints(int id)
    {
        var assignment = await _assignmentService.GetByIdAsync(id);
        if (assignment == null)
            return NotFound($"Zadanie s ID {id} neexistuje.");

        var maxPoints = await _assignmentService.CalculateMaxPoints(id);
        return Ok(maxPoints);
    }

    [HttpPost("upload-image")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromServices] IFileStorageService fileStorageService)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var relativePath = await fileStorageService.SaveFileAsync(file, "assignments");
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var url = $"{baseUrl}/{relativePath.Replace("\\", "/")}";

        return Ok(new { location = url });
    }

    private async Task<IEnumerable<int>?> GetAssistantAllowedCourseIdsOrNullAsync()
    {
        if (!User.IsInRole("Assistant"))
            return null;

        var userId = GetCurrentUserIdOrNull();
        if (!userId.HasValue)
            return Array.Empty<int>();

        return await _assistantPermissions.GetAnyPermissionCourseIdsAsync(userId.Value);
    }

    private async Task<int?> GetAssignmentCourseIdAsync(int assignmentId)
    {
        return await _db.Assignments
            .AsNoTracking()
            .Where(a => a.Id == assignmentId)
            .Select(a => (int?)a.CourseId)
            .FirstOrDefaultAsync();
    }

    private async Task<bool> CanReadCourseContentAsync(int courseId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        var userId = GetCurrentUserIdOrNull();
        return userId.HasValue &&
            await _assistantPermissions.CanViewCourseContentAsync(userId.Value, courseId);
    }

    private async Task<bool> CanManageCourseContentAsync(int courseId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        var userId = GetCurrentUserIdOrNull();
        return userId.HasValue &&
            await _assistantPermissions.CanManageCourseContentAsync(userId.Value, courseId);
    }

    private async Task<bool> CanGradeCourseAsync(int courseId)
    {
        if (!User.IsInRole("Assistant"))
            return true;

        var userId = GetCurrentUserIdOrNull();
        return userId.HasValue &&
            await _assistantPermissions.CanGradeCourseAsync(userId.Value, courseId);
    }

    private int? GetCurrentUserIdOrNull()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return claim == null ? null : int.Parse(claim.Value);
    }
}
