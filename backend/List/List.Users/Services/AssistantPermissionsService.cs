using List.Users.Data;
using List.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Users.Services;

public class AssistantPermissionService : IAssistantPermissionService
{
    private readonly UsersDbContext _context;

    public AssistantPermissionService(UsersDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CanViewCourseContentAsync(int assistantUserId, int courseId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p =>
                p.AssistantUserId == assistantUserId &&
                p.CourseId == courseId &&
                p.CanViewCourseContent);
    }

    public async Task<bool> CanManageCourseContentAsync(int assistantUserId, int courseId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p =>
                p.AssistantUserId == assistantUserId &&
                p.CourseId == courseId &&
                p.CanManageCourseContent);
    }

    public async Task<bool> CanGradeCourseAsync(int assistantUserId, int courseId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p =>
                p.AssistantUserId == assistantUserId &&
                p.CourseId == courseId &&
                p.CanGradeCourse);
    }

    public async Task<bool> CanRunPlagiarismCheckAsync(int assistantUserId, int courseId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p =>
                p.AssistantUserId == assistantUserId &&
                p.CourseId == courseId &&
                p.CanRunPlagiarismCheck);
    }

    public async Task<bool> HasAnyPermissionAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p =>
                p.AssistantUserId == assistantUserId &&
                (p.CanViewCourseContent ||
                 p.CanManageCourseContent ||
                 p.CanGradeCourse ||
                 p.CanRunPlagiarismCheck));
    }

    public async Task<bool> HasAnyManageCourseContentAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .AnyAsync(p => p.AssistantUserId == assistantUserId && p.CanManageCourseContent);
    }

    public async Task<List<int>> GetViewCourseIdsAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == assistantUserId && p.CanViewCourseContent)
            .Select(p => p.CourseId)
            .ToListAsync();
    }

    public async Task<List<int>> GetManageCourseIdsAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == assistantUserId && p.CanManageCourseContent)
            .Select(p => p.CourseId)
            .ToListAsync();
    }

    public async Task<List<int>> GetGradeCourseIdsAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == assistantUserId && p.CanGradeCourse)
            .Select(p => p.CourseId)
            .ToListAsync();
    }

    public async Task<List<int>> GetPlagiarismCourseIdsAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p => p.AssistantUserId == assistantUserId && p.CanRunPlagiarismCheck)
            .Select(p => p.CourseId)
            .ToListAsync();
    }

    public async Task<List<int>> GetAnyPermissionCourseIdsAsync(int assistantUserId)
    {
        return await _context.AssistantCoursePermissions
            .AsNoTracking()
            .Where(p =>
                p.AssistantUserId == assistantUserId &&
                (p.CanViewCourseContent ||
                 p.CanManageCourseContent ||
                 p.CanGradeCourse ||
                 p.CanRunPlagiarismCheck))
            .Select(p => p.CourseId)
            .Distinct()
            .ToListAsync();
    }
}
