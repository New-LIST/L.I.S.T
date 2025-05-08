using List.Tasks.Models;

namespace List.Tasks.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskModel>> GetAllTasksAsync();
    Task<TaskModel?> GetTaskAsync(int id);
    Task<bool> AddTaskAsync(TaskModel task, string userId);
    Task<bool> UpdateTaskAsync(int id, TaskModel updatedTask, string userId);
    Task<bool> DeleteTaskAsync(int id, string userId);

    Task<IEnumerable<TaskModel>> FilterTasksAsync(string? name, string? author, string? categoryFilter);


}
