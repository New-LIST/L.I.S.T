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

    public async Task<IEnumerable<TaskModel>> FilterTasksAsync(string? name, string? author, string? categoryFilter)
    {
        var query = context.Tasks
            .Include(t => t.Author)
            .Include(t => t.TaskCategories)
                .ThenInclude(tc => tc.Category) // odporúčané ak chceš neskôr použiť názvy kategórií
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(t => t.Name.ToLower().Contains(name.ToLower()));

        if (!string.IsNullOrWhiteSpace(author))
            query = query.Where(t => t.Author.Fullname.ToLower().Contains(author.ToLower()));

        List<TaskModel> result;

        if (!string.IsNullOrWhiteSpace(categoryFilter))
        {
            var blocks = categoryFilter.Split('|', StringSplitOptions.RemoveEmptyEntries)
                .Select(raw =>
                {
                    var parts = raw.Split(';', StringSplitOptions.RemoveEmptyEntries);

                    var include = parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0])
                        ? parts[0].Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.TryParse(s, out var id) ? id : -1)
                            .Where(id => id > 0)
                            .ToList()
                        : new List<int>();

                    var exclude = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1])
                        ? parts[1].TrimStart('!').Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.TryParse(s, out var id) ? id : -1)
                            .Where(id => id > 0)
                            .ToList()
                        : new List<int>();

                    Console.WriteLine("Include: " + string.Join(", ", include));
                    Console.WriteLine("Exclude: " + string.Join(", ", exclude));

                    return new { Include = include, Exclude = exclude };
                })
                .Where(b => b.Include.Any() || b.Exclude.Any())
                .ToList();

            foreach (var block in blocks)
            {
                Console.WriteLine("BLOCK");
                Console.WriteLine("  Include: " + string.Join(", ", block.Include));
                Console.WriteLine("  Exclude: " + string.Join(", ", block.Exclude));
            }

            result = query
                .AsEnumerable() // tu prepneme na vyhodnocovanie v pamäti
                .Where(t =>
                    blocks.Any(b =>
                        b.Include.All(catId => t.TaskCategories.Any(tc => tc.CategoryId == catId)) &&
                        b.Exclude.All(catId => t.TaskCategories.All(tc => tc.CategoryId != catId))
                    )
                )
                .ToList();
        }
        else
        {
            result = await query.ToListAsync();
        }

        return result;
    }



}
