using List.Assignments.Models;
using List.Assignments.DTOs;

namespace List.Assignments.Services;

public interface IAssignmentTaskRelService
{
    Task<AssignmentTaskRelModel> CreateAsync(CreateAssignmentTaskRelDto dto);
    Task<bool> DeleteAsync(int taskId, int assignmentId);

    Task<List<AssignmentTaskRelModel>> GetAllAsync();
    Task<List<AssignmentTaskRelModel>> GetByAssignmentIdAsync(int assignmentId);
    Task<AssignmentTaskRelModel?> UpdateAsync(CreateAssignmentTaskRelDto dto);
    Task<List<AssignmentTaskRelSlimDto>> GetSlimByAssignmentIdAsync(int assignmentId);

    Task<List<AssignmentTaskRelModel>> GetByTaskIdAsync(int taskId);
}
