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
        var success = await _categoryService.AddCategoryAsync(dto);
        return success ? Ok() : BadRequest("Nepodarilo sa vytvoriť kategóriu.");
    }

    [HttpPut("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
    {
        var success = await _categoryService.UpdateCategoryAsync(id, dto);
        return success ? NoContent() : BadRequest("Nepodarilo sa upraviť kategóriu.");
    }

    [HttpDelete("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        return success ? NoContent() : NotFound();
    }
}
