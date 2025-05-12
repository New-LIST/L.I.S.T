namespace List.Assignments.Services;

using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Common.Models;


public interface IAssignmentService
{
    Task<List<AssignmentModel>> GetAllAsync();
    Task<PagedResult<AssignmentModel>> GetFilteredAsync(AssignmentFilterDto filter);
    Task<AssignmentModel?> GetByIdAsync(int id);
    Task<AssignmentModel> CreateAsync(CreateAssignmentDto assignmentDto);
    Task<AssignmentModel?> UpdateAsync(int id, CreateAssignmentDto updatedAssignmentDto);
    Task<AssignmentModel?> DeleteAsync(int id);

}
