using List.TaskSets.Data;
using List.TaskSets.Dtos;
using List.TaskSets.Models;
using List.Logs.Services;
using Microsoft.EntityFrameworkCore;

namespace List.TaskSets.Services;

public class TaskSetTypeService : ITaskSetTypeService
{

    private readonly TaskSetsDbContext context;

    public TaskSetTypeService(TaskSetsDbContext context)
    {
        this.context = context;
    }


    public async Task<List<TaskSetTypeDto>> GetAllAsync()
    {
        return await context.TaskSetTypes
            .Select(t => new TaskSetTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Identifier = t.Identifier
            })
            .ToListAsync();
    }

    public async Task<List<string>> GetIdentifiersByCourseIdAsync(int courseId)
    {
        return await context.CourseTaskSetRels
            .Where(rel => rel.CourseId == courseId)
            .Join(
                context.TaskSetTypes,
                rel => rel.TaskSetTypeId,
                type => type.Id,
                (rel, type) => type.Identifier
            )
            .Where(identifier => !string.IsNullOrEmpty(identifier))
            .Distinct()
            .ToListAsync();
    }

    public async Task<TaskSetTypeDto?> CreateAsync(TaskSetTypeDto dto)
    {
        // Kontrola unikátneho mena
        var existingByName = await context.TaskSetTypes
            .FirstOrDefaultAsync(t => t.Name == dto.Name);

        if (existingByName != null)
            throw new InvalidOperationException($"Task set type with name '{dto.Name}' already exists.");

        // Kontrola unikátneho identifier (ak nie je null)
        if (!string.IsNullOrEmpty(dto.Identifier))
        {
            var existingByIdentifier = await context.TaskSetTypes
                .FirstOrDefaultAsync(t => t.Identifier == dto.Identifier);

            if (existingByIdentifier != null)
                throw new InvalidOperationException($"Task set type with identifier '{dto.Identifier}' already exists.");
        }
        var entity = new TaskSetType
        {
            Name = dto.Name,
            Identifier = dto.Identifier
        };

        context.TaskSetTypes.Add(entity);
        await context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<TaskSetTypeDto?> UpdateAsync(TaskSetTypeDto dto)
    {
        var existing = await context.TaskSetTypes.FindAsync(dto.Id);
        if (existing == null)
            return null;


        // Kontrola na duplicitu mena (s výnimkou vlastného záznamu)
        var existingByName = await context.TaskSetTypes
            .FirstOrDefaultAsync(t => t.Name == dto.Name && t.Id != dto.Id);

        if (existingByName != null)
            throw new InvalidOperationException($"Task set type with name '{dto.Name}' already exists.");

        // Kontrola na duplicitu identifier (ak nie je null)
        if (!string.IsNullOrEmpty(dto.Identifier))
        {
            var existingByIdentifier = await context.TaskSetTypes
                .FirstOrDefaultAsync(t => t.Identifier == dto.Identifier && t.Id != dto.Id);

            if (existingByIdentifier != null)
                throw new InvalidOperationException($"Task set type with identifier '{dto.Identifier}' already exists.");
        }

        existing.Name = dto.Name;
        existing.Identifier = dto.Identifier;

        await context.SaveChangesAsync();


        return new TaskSetTypeDto
        {
            Id = existing.Id,
            Name = existing.Name,
            Identifier = existing.Identifier
        };
    }

    public async Task<TaskSetTypeDto?> DeleteAsync(int id)
    {
        var existing = await context.TaskSetTypes.FindAsync(id);
        if (existing == null)
            return null;

        context.TaskSetTypes.Remove(existing);
        await context.SaveChangesAsync();


        return new TaskSetTypeDto
        {
            Id = existing.Id,
            Name = existing.Name,
            Identifier = existing.Identifier
        };
    }

}
