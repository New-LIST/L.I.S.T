using List.TaskSets.Dtos;

namespace List.TaskSets.Services;

public interface ITaskSetTypeService
{
    Task<List<TaskSetTypeDto>> GetAllAsync();

    Task<List<string>> GetIdentifiersByCourseIdAsync(int courseId);

    Task<TaskSetTypeDto> CreateAsync(TaskSetTypeDto dto, string userId);

    Task<TaskSetTypeDto?> UpdateAsync(TaskSetTypeDto dto, string userId);

    Task<bool> DeleteAsync(int id, string userId); 

}
