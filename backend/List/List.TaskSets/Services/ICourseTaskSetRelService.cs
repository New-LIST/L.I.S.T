using List.TaskSets.Dtos;
using List.TaskSets.Models;

namespace List.TaskSets.Services;

public interface ICourseTaskSetRelService
{
    Task<List<CourseTaskSetRelDto>> GetAllAsync();
    Task<CourseTaskSetRelDto?> GetByIdAsync(int id);
    Task<List<CourseTaskSetRelDto>> GetByCourseIdAsync(int courseId);

    Task<IEnumerable<TaskSetType>> GetTypesForCourseAsync(int courseId);


    Task<CourseTaskSetRelDto?> CreateAsync(CourseTaskSetRelDto dto);
    Task<CourseTaskSetRelDto?> UpdateAsync(int id, CourseTaskSetRelDto dto);
    Task<CourseTaskSetRelDto?> DeleteAsync(int id);

    Task<int?> GetDependentCountAsync(int id);

}
