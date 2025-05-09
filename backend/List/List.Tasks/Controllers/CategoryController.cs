using List.Tasks.DTOs;
using List.Tasks.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace List.Server.Controllers.Tasks;

[ApiController]
[Route("api/[controller]")]
public class CategoryController(ICategoryService categoryService) : ControllerBase
{
    private readonly ICategoryService _categoryService = categoryService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryAsync(id);
        if (category == null)
            return NotFound();

        var dto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId
        };

        return Ok(dto);
    }

    [HttpPost]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
    {
        var category = await _categoryService.AddCategoryAsync(dto);
    return category != null
        ? Ok(new { id = category.Id, name = category.Name })
        : BadRequest("Nepodarilo sa vytvoriť kategóriu.");
    }

    [HttpPut("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
    {
        var updated = await _categoryService.UpdateCategoryAsync(id, dto);
    return updated != null
        ? Ok(new { id = updated.Id, name = updated.Name })
        : BadRequest("Nepodarilo sa upraviť kategóriu.");
    }

    [HttpDelete("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var deleted = await _categoryService.DeleteCategoryAsync(id);
    return deleted != null
        ? Ok(new { id = deleted.Id, name = deleted.Name })
        : NotFound();
    }
}
