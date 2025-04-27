using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using Microsoft.EntityFrameworkCore;

namespace List.Assignments.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AssignmentsDbContext _dbContext;

    public AssignmentService(AssignmentsDbContext dbContext)
    {
        _dbContext = dbContext;
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

    public async Task<AssignmentModel> CreateAsync(CreateAssignmentDto assignmentDto)
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
        return assignment;
    }

    public async Task<AssignmentModel?> UpdateAsync(int id, CreateAssignmentDto updatedAssignmentDto)
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
        return existingAssignment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var assignment = await _dbContext.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return false;
        }

        _dbContext.Assignments.Remove(assignment);
        await _dbContext.SaveChangesAsync();
        return true;
    }

}
