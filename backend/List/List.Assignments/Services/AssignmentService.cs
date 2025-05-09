using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Common.Models;

using List.Logs.Services;
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

    public async Task<PagedResult<AssignmentModel>> GetFilteredAsync(AssignmentFilterDto filter)
    {
        var query = _dbContext.Assignments
            .Include(a => a.Course)
            .Include(a => a.TaskSetType)
            .Include(a => a.Teacher)
            .AsQueryable();

        if (filter.UserId.HasValue)
            query = query.Where(a => a.TeacherId == filter.UserId);

        if (!string.IsNullOrWhiteSpace(filter.Name))
            query = query.Where(a => a.Name.ToLower().Contains(filter.Name.ToLower()));

        if (filter.CourseId.HasValue)
            query = query.Where(a => a.CourseId == filter.CourseId);

        // Count before pagination
        var totalCount = await query.CountAsync();

        // Sorting
        query = filter.Sort?.ToLower() switch
        {
            "name" => filter.Desc ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name),
            "publishstarttime" => filter.Desc ? query.OrderByDescending(a => a.PublishStartTime) : query.OrderBy(a => a.PublishStartTime),
            "created" => filter.Desc ? query.OrderByDescending(a => a.Created) : query.OrderBy(a => a.Created),
            _ => query.OrderByDescending(a => a.Created)
        };

        // Pagination
        var skip = (filter.Page - 1) * filter.PageSize;
        var items = await query.Skip(skip).Take(filter.PageSize).ToListAsync();

        return new PagedResult<AssignmentModel>
        {
            Items = items,
            TotalCount = totalCount
        };
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
            InternalComment = assignmentDto.InternalComment,
            TeacherId = assignmentDto.TeacherId
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

    public async Task<AssignmentModel?> DeleteAsync(int id)
    {
        var assignment = await _dbContext.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return null;
        }

        _dbContext.Assignments.Remove(assignment);
        await _dbContext.SaveChangesAsync();



        return assignment;
    }

}
