using List.Tasks.Models;

namespace List.Tasks.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskModel>> GetAllTasksAsync();
    Task<TaskModel?> GetTaskAsync(int id);
    Task<bool> AddTaskAsync(TaskModel task);
    Task<bool> UpdateTaskAsync(int id, TaskModel updatedTask);
    Task<bool> DeleteTaskAsync(int id);

    Task<IEnumerable<TaskModel>> FilterTasksAsync(string? name, string? author, string? categoryFilter);


}
