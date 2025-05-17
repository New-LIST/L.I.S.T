using List.Assignments.Models;
using List.Assignments.Services;
using List.Assignments.DTOs;
using List.Common.Models;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;


namespace List.Assignments.Controllers;

[ApiController]
[Route("api/assignments/{assignmentId}/solutions")]
public class SubmissionController : ControllerBase
{
    private readonly ISubmissionService _svc;

    public SubmissionController(ISubmissionService svc)
    {
        _svc = svc;
    }

    [HttpPost("versions")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadVersion(
        int assignmentId,
        [FromForm] IFormFile file, [FromForm] string? comment  // tu očakávame zipsovaný IFormFile
    )
    {

        if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Prosím nahrajte súbor vo formáte ZIP.");
        }
        // môžeš kontrolovať, či assignmentId zodpovedá solution.AssignmentId
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null)
            return BadRequest("Chýba identifikátor študenta.");
        var studentId = int.Parse(claim.Value);

        string ip = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
          ?? HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString()
          ?? "0.0.0.0";


        var version = await _svc.AddVersionAsync(
            assignmentId,
            studentId,
            file,
            ip,
            comment
        );
        return Ok(new
        {
            version.Id,
            version.Version,
            version.StorageKey
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSolutions(int assignmentId)
    {
        var solutions = await _svc.GetAllSolutionsAsync();
        return Ok(solutions);
    }

    // GET  /api/assignments/{assignmentId}/solutions/{solutionId}/versions
    [HttpGet("{solutionId}/versions")]
    public async Task<IActionResult> GetVersionsBySolutionId(
        int assignmentId,
        int solutionId)
    {
        // voliteľne overenie: riešenie patrí pod assignment
        var versions = await _svc.GetVersionsBySolutionIdAsync(solutionId);
        return Ok(versions);
    }
}
