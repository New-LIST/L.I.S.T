namespace List.Assignments.Services;

using List.Assignments.Models;
using List.Assignments.DTOs;


public interface IAssignmentService
{
    Task<List<AssignmentModel>> GetAllAsync();
    Task<AssignmentModel?> GetByIdAsync(int id);
    Task<AssignmentModel> CreateAsync(CreateAssignmentDto assignmentDto, string userId);
    Task<AssignmentModel?> UpdateAsync(int id, CreateAssignmentDto updatedAssignmentDto, string userId);
    Task<bool> DeleteAsync(int id, string userId);

}
