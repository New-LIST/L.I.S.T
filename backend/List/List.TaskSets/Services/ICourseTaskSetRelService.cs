using List.TaskSets.Dtos;

namespace List.TaskSets.Services;

public interface ICourseTaskSetRelService
{
    Task<List<CourseTaskSetRelDto>> GetAllAsync();
    Task<CourseTaskSetRelDto?> GetByIdAsync(int id);
    Task<CourseTaskSetRelDto> CreateAsync(CourseTaskSetRelDto dto);
    Task<CourseTaskSetRelDto?> UpdateAsync(int id, CourseTaskSetRelDto dto);
    Task<bool> DeleteAsync(int id);
}
