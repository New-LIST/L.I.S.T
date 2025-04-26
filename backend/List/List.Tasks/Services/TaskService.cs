using List.Tasks.Data;
using List.Tasks.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Tasks.Services;

public class TaskService(TasksDbContext context) : ITaskService
{
    public async Task<IEnumerable<TaskModel>> GetAllTasksAsync()
    {
        return await context.Tasks
            .Include(t => t.Author)
            .ToListAsync();
    }

    public async Task<TaskModel?> GetTaskAsync(int id)
    {
        return await context.Tasks
            .Include(t => t.Author)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<bool> AddTaskAsync(TaskModel task)
    {
        context.Tasks.Add(task);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateTaskAsync(int id, TaskModel updatedTask)
    {
        var existingTask = await context.Tasks.FindAsync(id);
        if (existingTask is null) return false;

        existingTask.Name = updatedTask.Name;
        existingTask.Text = updatedTask.Text;
        existingTask.InternalComment = updatedTask.InternalComment;
        existingTask.Updated = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await context.Tasks.FindAsync(id);
        if (task is null) return false;

        context.Tasks.Remove(task);
        await context.SaveChangesAsync();
        return true;
    }

} 
