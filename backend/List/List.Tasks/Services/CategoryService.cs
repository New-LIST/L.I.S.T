using List.Tasks.Data;
using List.Tasks.Models;
using List.Tasks.DTOs;
using List.Logs.Services;
using Microsoft.EntityFrameworkCore;

namespace List.Tasks.Services;

public class CategoryService : ICategoryService
{
    private readonly TasksDbContext context;

    public CategoryService(TasksDbContext context)
    {
        this.context = context;
    }
    private CategoryDto MapCategory(CategoryModel category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Children = category.Children?.Select(MapCategory).ToList() ?? new()
        };
    }

    public async Task<CategoryModel?> AddCategoryAsync(CategoryDto cat)
    {
        if (cat.ParentId != null)
        {
            var parentExists = await context.Categories.AnyAsync(c => c.Id == cat.ParentId);
            if (!parentExists)
                return null;
        }

        var duplicateExists = await context.Categories.AnyAsync(c =>
            c.Name.ToLower() == cat.Name.ToLower() &&
            ((c.ParentId == null && cat.ParentId == null) || c.ParentId == cat.ParentId));

        if (duplicateExists)
            return null;

        var category = new CategoryModel
        {
            Name = cat.Name,
            ParentId = cat.ParentId
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return category;
    }

    public async Task<CategoryModel?> DeleteCategoryAsync(int id)
    {
        var category = await context.Categories.FindAsync(id);
        if (category == null)
            return null;

        context.Categories.Remove(category);
        await context.SaveChangesAsync();


        return category;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        var allCategories = await context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();

        var lookup = allCategories.ToLookup(c => c.ParentId);

        List<CategoryDto> BuildTree(int? parentId)
        {
            return lookup[parentId]
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    ParentId = c.ParentId,
                    Children = BuildTree(c.Id)
                })
                .ToList();
        }

        return BuildTree(null);
    }

    public async Task<CategoryModel?> GetCategoryAsync(int id)
    {
        return await context.Categories.FindAsync(id);
    }

    public async Task<CategoryModel?> UpdateCategoryAsync(int id, CategoryDto upCat)
    {
        var category = await context.Categories.FindAsync(id);
        if (category == null)
            return null;

        var duplicateExists = await context.Categories.AnyAsync(c =>
            c.Id != id &&
            c.Name.ToLower() == upCat.Name.ToLower() &&
            ((c.ParentId == null && upCat.ParentId == null) || c.ParentId == upCat.ParentId));

        if (duplicateExists)
            return null;

        category.Name = upCat.Name;
        category.ParentId = upCat.ParentId;
        await context.SaveChangesAsync();
        
        return category;
    }
}