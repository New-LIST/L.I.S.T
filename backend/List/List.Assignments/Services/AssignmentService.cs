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
            "id" => filter.Desc ? query.OrderByDescending(a => a.Id) : query.OrderBy(a => a.Id),
            "course" => filter.Desc ? query.OrderByDescending(a => a.Course.Name) : query.OrderBy(a => a.Course.Name),
            "teacher" => filter.Desc ? query.OrderByDescending(a => a.Teacher.Email) : query.OrderBy(a => a.Teacher.Email),
            "created" => filter.Desc ? query.OrderByDescending(a => a.Created) : query.OrderBy(a => a.Created),
            "updated" => filter.Desc ? query.OrderByDescending(a => a.Updated) : query.OrderBy(a => a.Updated),
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
            PublishStartTime = assignmentDto.PublishStartTime?.ToUniversalTime(),
            UploadEndTime = assignmentDto.UploadEndTime?.ToUniversalTime(),
            Instructions = assignmentDto.Instructions,
            PointsOverride = assignmentDto.PointsOverride,
            InternalComment = assignmentDto.InternalComment,
            TeacherId = assignmentDto.TeacherId
        };
        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync();


        return assignment;
    }

    public async Task<List<AssignmentModel>> GetByCourseAsync(int courseId)
    {
        return await _dbContext.Assignments
            .Where(a => a.CourseId == courseId)
           .Include(a => a.TaskSetType)
           .ToListAsync();
    }

    public async Task<AssignmentModel> CloneAsync(int id)
    {
        // 1) Načítať pôvodné zadanie
        var original = await _dbContext.Assignments
            .FirstOrDefaultAsync(a => a.Id == id);
        if (original == null)
            throw new KeyNotFoundException($"Assignment {id} not found");

        // 2) Vytvoriť nový AssignmentModel s rovnakými poľami (okrem Id, Created/Updated)
        var clone = new AssignmentModel
        {
            Name = original.Name,
            TaskSetTypeId = original.TaskSetTypeId,
            CourseId = original.CourseId,
            Published = original.Published,
            PublishStartTime = original.PublishStartTime,
            UploadEndTime = original.UploadEndTime,
            Instructions = original.Instructions,
            PointsOverride = original.PointsOverride,
            InternalComment = original.InternalComment,
            TeacherId = original.TeacherId,
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow
        };
        _dbContext.Assignments.Add(clone);
        await _dbContext.SaveChangesAsync();

        // 3) Naklonovať väzby úloh (AssignmentTaskRels)
        var rels = await _dbContext.AssignmentTaskRels
            .Where(r => r.AssignmentId == id)
            .ToListAsync();

        foreach (var r in rels)
        {
            var newRel = new AssignmentTaskRelModel
            {
                AssignmentId = clone.Id,
                TaskId = r.TaskId,
                PointsTotal = r.PointsTotal,
                BonusTask = r.BonusTask,
                InternalComment = r.InternalComment
            };
            _dbContext.AssignmentTaskRels.Add(newRel);
        }
        await _dbContext.SaveChangesAsync();

        return clone;
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
        existingAssignment.PublishStartTime = updatedAssignmentDto.PublishStartTime?.ToUniversalTime();
        existingAssignment.UploadEndTime = updatedAssignmentDto.UploadEndTime?.ToUniversalTime();
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
