using List.Tasks.Models;
using List.Tasks.DTOs;

namespace List.Tasks.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryModel?> GetCategoryAsync(int id);
    Task<CategoryModel?> AddCategoryAsync(CategoryDto cat);
    Task<CategoryModel?> UpdateCategoryAsync(int id, CategoryDto  upCat);
    Task<CategoryModel?> DeleteCategoryAsync(int id);

}