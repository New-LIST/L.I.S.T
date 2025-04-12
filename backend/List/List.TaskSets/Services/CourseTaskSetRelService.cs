using List.TaskSets.Data;
using List.TaskSets.Dtos;
using List.TaskSets.Models;
using List.TaskSets.Formula;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace List.TaskSets.Services;

public class CourseTaskSetRelService(TaskSetsDbContext context) : ICourseTaskSetRelService
{

    public async Task<List<CourseTaskSetRelDto>> GetAllAsync()
    {
        return await context.CourseTaskSetRels
            .Select(rel => new CourseTaskSetRelDto
            {
                Id = rel.Id,
                CourseId = rel.CourseId,
                TaskSetTypeId = rel.TaskSetTypeId,
                UploadSolution = rel.UploadSolution,
                MinPoints = rel.MinPoints,
                MinPointsInPercentage = rel.MinPointsInPercentage,
                IncludeInTotal = rel.IncludeInTotal,
                Virtual = rel.Virtual,
                Formula = rel.Formula,
                FormulaObject = rel.FormulaObject
            })
            .ToListAsync();
    }

    public async Task<CourseTaskSetRelDto?> GetByIdAsync(int id)
    {
        var rel = await context.CourseTaskSetRels.FindAsync(id);
        if (rel == null) return null;

        return new CourseTaskSetRelDto
        {
            Id = rel.Id,
            CourseId = rel.CourseId,
            TaskSetTypeId = rel.TaskSetTypeId,
            UploadSolution = rel.UploadSolution,
            MinPoints = rel.MinPoints,
            MinPointsInPercentage = rel.MinPointsInPercentage,
            IncludeInTotal = rel.IncludeInTotal,
            Virtual = rel.Virtual,
            Formula = rel.Formula,
            FormulaObject = rel.FormulaObject
        };
    }

    public async Task<List<CourseTaskSetRelDto>> GetByCourseIdAsync(int courseId)
    {
        return await context.CourseTaskSetRels
            .Where(r => r.CourseId == courseId)
            .Select(rel => new CourseTaskSetRelDto
            {
                Id = rel.Id,
                CourseId = rel.CourseId,
                TaskSetTypeId = rel.TaskSetTypeId,
                UploadSolution = rel.UploadSolution,
                MinPoints = rel.MinPoints,
                MinPointsInPercentage = rel.MinPointsInPercentage,
                IncludeInTotal = rel.IncludeInTotal,
                Virtual = rel.Virtual,
                Formula = rel.Formula,
                FormulaObject = rel.FormulaObject
            })
            .ToListAsync();
    }

    public async Task<CourseTaskSetRelDto> CreateAsync(CourseTaskSetRelDto dto)
    {
        var entity = new CourseTaskSetRel
        {
            CourseId = dto.CourseId,
            TaskSetTypeId = dto.TaskSetTypeId,
            UploadSolution = dto.UploadSolution,
            MinPoints = dto.MinPoints,
            MinPointsInPercentage = dto.MinPointsInPercentage,
            IncludeInTotal = dto.IncludeInTotal,
            Virtual = dto.Virtual,
            Formula = dto.Formula
        };

        if (!string.IsNullOrWhiteSpace(dto.Formula))
        {
            var parser = new FormulaExpressionParser();
            var ast = parser.Parse(dto.Formula!);
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters = { new FormulaNodeJsonConverter() },
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping

            };

            entity.FormulaObject = JsonSerializer.Serialize(ast, options);
        }

        var exists = await context.CourseTaskSetRels.AnyAsync(r =>
                r.CourseId == dto.CourseId && r.TaskSetTypeId == dto.TaskSetTypeId);

        if (exists)
        {
            throw new InvalidOperationException("Zostava s týmto typom pre daný kurz už existuje.");
        }

        context.CourseTaskSetRels.Add(entity);
        await context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<CourseTaskSetRelDto?> UpdateAsync(int id, CourseTaskSetRelDto dto)
    {
        var entity = await context.CourseTaskSetRels.FindAsync(id);
        if (entity == null) return null;

        entity.CourseId = dto.CourseId;
        entity.TaskSetTypeId = dto.TaskSetTypeId;
        entity.UploadSolution = dto.UploadSolution;
        entity.MinPoints = dto.MinPoints;
        entity.MinPointsInPercentage = dto.MinPointsInPercentage;
        entity.IncludeInTotal = dto.IncludeInTotal;
        entity.Virtual = dto.Virtual;
        entity.Formula = dto.Formula;

        if (!string.IsNullOrWhiteSpace(dto.Formula))
        {
            var parser = new FormulaExpressionParser();
            var ast = parser.Parse(dto.Formula!);
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters = { new FormulaNodeJsonConverter() },
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping

            };

            entity.FormulaObject = JsonSerializer.Serialize(ast, options);
        }
        else
        {
            entity.FormulaObject = null;
        }

        await context.SaveChangesAsync();

        return dto;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await context.CourseTaskSetRels.FindAsync(id);
        if (entity == null) return false;

        context.CourseTaskSetRels.Remove(entity);
        await context.SaveChangesAsync();
        return true;
    }
}
