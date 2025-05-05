using List.Tasks.Models;
using List.Tasks.DTOs;

namespace List.Tasks.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryModel?> GetCategoryAsync(int id);
    Task<bool> AddCategoryAsync(CategoryDto cat);
    Task<bool> UpdateCategoryAsync(int id, CategoryDto  upCat);
    Task<bool> DeleteCategoryAsync(int id);

}