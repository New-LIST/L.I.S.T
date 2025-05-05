using List.Tasks.Data;
using List.Tasks.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Tasks.Services;

public class TaskCategoryRelService(TasksDbContext context) : ITaskCategoryRelService
{
    private readonly TasksDbContext _context = context;

    public async Task<bool> AddRelationAsync(int taskId, int categoryId)
    {
        var exists = await _context.TaskCategoryRels.AnyAsync(r => r.TaskId == taskId && r.CategoryId == categoryId);
        if (exists)
            return false;

        var relation = new TaskCategoryRel
        {
            TaskId = taskId,
            CategoryId = categoryId
        };

        _context.TaskCategoryRels.Add(relation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRelationAsync(int taskId, int categoryId)
    {
        var rel = await _context.TaskCategoryRels
            .FirstOrDefaultAsync(r => r.TaskId == taskId && r.CategoryId == categoryId);

        if (rel == null)
            return false;

        _context.TaskCategoryRels.Remove(rel);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<int>> GetCategoryIdsByTaskAsync(int taskId)
    {
        return await _context.TaskCategoryRels
            .Where(r => r.TaskId == taskId)
            .Select(r => r.CategoryId)
            .ToListAsync();
    }

    public async Task<IEnumerable<int>> GetTaskIdsByCategoryAsync(int categoryId)
    {
        return await _context.TaskCategoryRels
            .Where(r => r.CategoryId == categoryId)
            .Select(r => r.TaskId)
            .ToListAsync();
    }
}
