namespace List.Assignments.Services;

using List.Assignments.Models;
using List.Assignments.DTOs;


public interface IAssignmentService
{
    Task<List<AssignmentModel>> GetAllAsync();
    Task<AssignmentModel?> GetByIdAsync(int id);
    Task<AssignmentModel> CreateAsync(CreateAssignmentDto assignmentDto);
    Task<AssignmentModel?> UpdateAsync(int id, CreateAssignmentDto updatedAssignmentDto);
    Task<bool> DeleteAsync(int id);

    Task<AssignmentTaskRelModel> AddTaskToAssignmentAsync(CreateAssignmentTaskRelDto dto);
    Task<bool> RemoveTaskFromAssignmentAsync(int taskId, int assignmentId);
}
