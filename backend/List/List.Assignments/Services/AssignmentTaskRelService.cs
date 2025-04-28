using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using Microsoft.EntityFrameworkCore;

namespace List.Assignments.Services;

public class AssignmentTaskRelService : IAssignmentTaskRelService
{
    private readonly AssignmentsDbContext _dbContext;

    public AssignmentTaskRelService(AssignmentsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AssignmentTaskRelModel> CreateAsync(CreateAssignmentTaskRelDto dto)
    {
        var rel = new AssignmentTaskRelModel
        {
            AssignmentId = dto.AssignmentId,
            TaskId = dto.TaskId,
            PointsTotal = dto.PointsTotal,
            BonusTask = dto.BonusTask,
            InternalComment = dto.InternalComment
        };

        _dbContext.AssignmentTaskRels.Add(rel);
        await _dbContext.SaveChangesAsync();
        return rel;
    }

    public async Task<bool> DeleteAsync(int taskId, int assignmentId)
    {
        var rel = await _dbContext.AssignmentTaskRels
            .FirstOrDefaultAsync(r => r.TaskId == taskId && r.AssignmentId == assignmentId);

        if (rel == null)
        {
            return false;
        }

        _dbContext.AssignmentTaskRels.Remove(rel);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<AssignmentTaskRelModel>> GetAllAsync()
    {
        return await _dbContext.AssignmentTaskRels
            .Include(r => r.Task)
            .Include(r => r.Assignment)
            .ToListAsync();
    }

    public async Task<List<AssignmentTaskRelModel>> GetByAssignmentIdAsync(int assignmentId)
    {
        return await _dbContext.AssignmentTaskRels
            .Where(r => r.AssignmentId == assignmentId)
            .Include(r => r.Task)
            .Include(r => r.Assignment)
            .ToListAsync();
    }

    public async Task<List<AssignmentTaskRelModel>> GetByTaskIdAsync(int taskId)
    {
        return await _dbContext.AssignmentTaskRels
            .Where(r => r.TaskId == taskId)
            .Include(r => r.Task)
            .Include(r => r.Assignment)
            .ToListAsync();
    }
}
