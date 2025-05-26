using List.Users.Data;
using List.Users.DTOs;
using List.Users.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List.Users.Controllers;

[ApiController]
[Route("api/assistant-permissions")]
public class AssistantPermissionsController(UsersDbContext context) : ControllerBase
{
    private readonly UsersDbContext _context = context;

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<AssistantPermissionsDto>> GetPermissions(int userId)
    {
        var permissions = await _context.AssistantPermissions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (permissions == null)
        {
            return Ok(new AssistantPermissionsDto { UserId = userId });
        }

        return Ok(new AssistantPermissionsDto
        {
            UserId = permissions.UserId,
            CanAddStudents = permissions.CanAddStudents,
            CanManageStudents = permissions.CanManageStudents,
            CanManageTaskTypes = permissions.CanManageTaskTypes,
            CanManagePeriods = permissions.CanManagePeriods,
            CanManageCategories = permissions.CanManageCategories,
            CanViewLogs = permissions.CanViewLogs
        });
    }

    [HttpPost]
    public async Task<IActionResult> SavePermissions([FromBody] AssistantPermissionsDto dto)
    {
        var existing = await _context.AssistantPermissions
            .FirstOrDefaultAsync(p => p.UserId == dto.UserId);

        if (existing != null)
        {
            existing.CanAddStudents = dto.CanAddStudents;
            existing.CanManageStudents = dto.CanManageStudents;
            existing.CanManageTaskTypes = dto.CanManageTaskTypes;
            existing.CanManagePeriods = dto.CanManagePeriods;
            existing.CanManageCategories = dto.CanManageCategories;
            existing.CanViewLogs = dto.CanViewLogs;
        }
        else
        {
            _context.AssistantPermissions.Add(new AssistantPermissions
            {
                UserId = dto.UserId,
                CanAddStudents = dto.CanAddStudents,
                CanManageStudents = dto.CanManageStudents,
                CanManageTaskTypes = dto.CanManageTaskTypes,
                CanManagePeriods = dto.CanManagePeriods,
                CanManageCategories = dto.CanManageCategories,
                CanViewLogs = dto.CanViewLogs
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}
