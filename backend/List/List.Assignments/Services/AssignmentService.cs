using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Logs.Services;
using Microsoft.EntityFrameworkCore;

namespace List.Assignments.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AssignmentsDbContext _dbContext;
    private readonly ILogService _logService;

    public AssignmentService(AssignmentsDbContext dbContext, ILogService logService)
    {
        _dbContext = dbContext;
        _logService = logService;
    }

    public async Task<List<AssignmentModel>> GetAllAsync()
    {
        return await _dbContext.Assignments
            .Include(a => a.TaskSetType)
            .Include(a => a.Course)
            .ToListAsync();
    }

    public async Task<AssignmentModel?> GetByIdAsync(int id)
    {
        return await _dbContext.Assignments
            .Include(a => a.TaskSetType)
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<AssignmentModel> CreateAsync(CreateAssignmentDto assignmentDto, string userId)
    {
        var assignment = new AssignmentModel
        {
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow,
            Name = assignmentDto.Name,
            TaskSetTypeId = assignmentDto.TaskSetTypeId,
            CourseId = assignmentDto.CourseId,
            Published = assignmentDto.Published,
            PublishStartTime = assignmentDto.PublishStartTime,
            UploadEndTime = assignmentDto.UploadEndTime,
            Instructions = assignmentDto.Instructions,
            PointsOverride = assignmentDto.PointsOverride,
            InternalComment = assignmentDto.InternalComment
        };
        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync();

        await _logService.LogAsync(userId, "POST", "assignment", assignment.Id, assignmentDto.Name);

        return assignment;
    }

    public async Task<AssignmentModel?> UpdateAsync(int id, CreateAssignmentDto updatedAssignmentDto, string userId)
    {
        var existingAssignment = await _dbContext.Assignments.FindAsync(id);
        if (existingAssignment == null)
        {
            return null;
        }

        existingAssignment.Updated = DateTime.UtcNow;
        existingAssignment.Name = updatedAssignmentDto.Name;
        existingAssignment.TaskSetTypeId = updatedAssignmentDto.TaskSetTypeId;
        existingAssignment.CourseId = updatedAssignmentDto.CourseId;
        existingAssignment.Published = updatedAssignmentDto.Published;
        existingAssignment.PublishStartTime = updatedAssignmentDto.PublishStartTime;
        existingAssignment.UploadEndTime = updatedAssignmentDto.UploadEndTime;
        existingAssignment.Instructions = updatedAssignmentDto.Instructions;
        existingAssignment.PointsOverride = updatedAssignmentDto.PointsOverride;
        existingAssignment.InternalComment = updatedAssignmentDto.InternalComment;

        await _dbContext.SaveChangesAsync();


        await _logService.LogAsync(userId, "UPDATE", "assignment", existingAssignment.Id, existingAssignment.Name);

        return existingAssignment;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var assignment = await _dbContext.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return false;
        }

        _dbContext.Assignments.Remove(assignment);
        await _dbContext.SaveChangesAsync();

        await _logService.LogAsync(userId, "DELETE", "assignment", assignment.Id, assignment.Name);

        
        return true;
    }

}
