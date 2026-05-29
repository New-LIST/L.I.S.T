using List.Users.Data;
using List.Users.DTOs;
using List.Users.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace List.Users.Controllers;

[ApiController]
[Route("api/assistant-permissions")]
[Authorize]
public class AssistantPermissionsController(UsersDbContext context) : ControllerBase
{
    private readonly UsersDbContext _context = context;

    [HttpGet("{userId:int}")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<List<AssistantCoursePermissionDto>>> GetPermissions(int userId)
    {
        var permissions = await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == userId)
            .OrderBy(p => p.CourseId)
            .Select(p => new AssistantCoursePermissionDto
            {
                Id = p.Id,
                UserId = p.AssistantUserId,
                CourseId = p.CourseId,
                CanViewCourseContent = p.CanViewCourseContent,
                CanManageCourseContent = p.CanManageCourseContent,
                CanGradeCourse = p.CanGradeCourse,
                CanRunPlagiarismCheck = p.CanRunPlagiarismCheck
            })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<AssistantCoursePermissionDto>>> GetMine()
    {
        var userId = GetCurrentUserId();
        var permissions = await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == userId)
            .OrderBy(p => p.CourseId)
            .Select(p => new AssistantCoursePermissionDto
            {
                Id = p.Id,
                UserId = p.AssistantUserId,
                CourseId = p.CourseId,
                CanViewCourseContent = p.CanViewCourseContent,
                CanManageCourseContent = p.CanManageCourseContent,
                CanGradeCourse = p.CanGradeCourse,
                CanRunPlagiarismCheck = p.CanRunPlagiarismCheck
            })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> SavePermissions([FromBody] AssistantCoursePermissionDto dto)
    {
        if (dto.CanManageCourseContent)
            dto.CanViewCourseContent = true;

        var assistant = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == dto.UserId && u.Role == UserRole.Assistant);

        if (assistant == null)
            return BadRequest("Vybrany pouzivatel nie je asistent.");

        var existing = await _context.AssistantCoursePermissions
            .FirstOrDefaultAsync(p => p.AssistantUserId == dto.UserId && p.CourseId == dto.CourseId);

        if (!dto.HasAnyPermission)
        {
            if (existing != null)
            {
                _context.AssistantCoursePermissions.Remove(existing);
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        if (existing != null)
        {
            existing.CanViewCourseContent = dto.CanViewCourseContent;
            existing.CanManageCourseContent = dto.CanManageCourseContent;
            existing.CanGradeCourse = dto.CanGradeCourse;
            existing.CanRunPlagiarismCheck = dto.CanRunPlagiarismCheck;
            existing.Updated = DateTime.UtcNow;
        }
        else
        {
            _context.AssistantCoursePermissions.Add(new AssistantCoursePermission
            {
                AssistantUserId = dto.UserId,
                CourseId = dto.CourseId,
                CanViewCourseContent = dto.CanViewCourseContent,
                CanManageCourseContent = dto.CanManageCourseContent,
                CanGradeCourse = dto.CanGradeCourse,
                CanRunPlagiarismCheck = dto.CanRunPlagiarismCheck,
                Created = DateTime.UtcNow,
                Updated = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

}
