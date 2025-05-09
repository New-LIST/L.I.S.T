using List.TaskSets.Dtos;

namespace List.TaskSets.Services;

public interface ITaskSetTypeService
{
    Task<List<TaskSetTypeDto>> GetAllAsync();

    Task<List<string>> GetIdentifiersByCourseIdAsync(int courseId);

    Task<TaskSetTypeDto?> CreateAsync(TaskSetTypeDto dto);

    Task<TaskSetTypeDto?> UpdateAsync(TaskSetTypeDto dto);

    Task<TaskSetTypeDto?> DeleteAsync(int id); 

}
