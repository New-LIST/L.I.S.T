namespace List.Tasks.Services;

public interface ITaskCategoryRelService
{
    Task<bool> AddRelationAsync(int taskId, int categoryId);
    Task<bool> DeleteRelationAsync(int taskId, int categoryId);
    Task<IEnumerable<int>> GetCategoryIdsByTaskAsync(int taskId);
    Task<IEnumerable<int>> GetTaskIdsByCategoryAsync(int categoryId);
}
