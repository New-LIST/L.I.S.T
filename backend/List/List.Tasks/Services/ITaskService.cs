using List.Tasks.Models;

namespace List.Tasks.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskModel>> GetAllTasksAsync();
    Task<TaskModel?> GetTaskAsync(int id);
    Task<TaskModel?> AddTaskAsync(TaskModel task);
    Task<TaskModel?> UpdateTaskAsync(int id, TaskModel updatedTask);
    Task<TaskModel?> DeleteTaskAsync(int id);

    Task<IEnumerable<TaskModel>> FilterTasksAsync(string? name, string? author, string? categoryFilter);


}
