using List.Tasks.Models;
using List.Tasks.DTOs;

namespace List.Tasks.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryModel?> GetCategoryAsync(int id);
    Task<bool> AddCategoryAsync(CategoryDto cat, string userId);
    Task<bool> UpdateCategoryAsync(int id, CategoryDto  upCat, string userId);
    Task<bool> DeleteCategoryAsync(int id, string userId);

}