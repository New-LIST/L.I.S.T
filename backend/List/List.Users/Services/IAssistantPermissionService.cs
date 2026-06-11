using System;
using System.Threading.Tasks;
using List.Users.Models;

namespace List.Users.Services;

public interface IAssistantPermissionService
{
    Task<bool> CanViewCourseContentAsync(int assistantUserId, int courseId);
    Task<bool> CanManageCourseContentAsync(int assistantUserId, int courseId);
    Task<bool> CanGradeCourseAsync(int assistantUserId, int courseId);
    Task<bool> CanRunPlagiarismCheckAsync(int assistantUserId, int courseId);
    Task<bool> HasAnyPermissionAsync(int assistantUserId);
    Task<bool> HasAnyManageCourseContentAsync(int assistantUserId);
    Task<List<int>> GetViewCourseIdsAsync(int assistantUserId);
    Task<List<int>> GetManageCourseIdsAsync(int assistantUserId);
    Task<List<int>> GetGradeCourseIdsAsync(int assistantUserId);
    Task<List<int>> GetPlagiarismCourseIdsAsync(int assistantUserId);
    Task<List<int>> GetAnyPermissionCourseIdsAsync(int assistantUserId);
}
