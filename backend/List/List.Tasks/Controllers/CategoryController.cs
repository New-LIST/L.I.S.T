using List.Tasks.DTOs;
using List.Tasks.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using List.Users.Services;
using System.Security.Claims;

namespace List.Server.Controllers.Tasks;

[ApiController]
[Route("api/[controller]")]
public class CategoryController(
    ICategoryService categoryService,
    IAssistantPermissionService assistantPermissions) : ControllerBase
{
    private readonly ICategoryService _categoryService = categoryService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        if (!await CanReadCategoriesAsync())
            return Forbid();

        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        if (!await CanReadCategoriesAsync())
            return Forbid();

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
        if (!await CanManageCategoriesAsync())
            return Forbid();

        var category = await _categoryService.AddCategoryAsync(dto);
    return category != null
        ? Ok(new { id = category.Id, name = category.Name })
        : BadRequest("Nepodarilo sa vytvoriť kategóriu.");
    }

    [HttpPut("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
    {
        if (!await CanManageCategoriesAsync())
            return Forbid();

        var updated = await _categoryService.UpdateCategoryAsync(id, dto);
    return updated != null
        ? Ok(new { id = updated.Id, name = updated.Name })
        : BadRequest("Nepodarilo sa upraviť kategóriu.");
    }

    [HttpDelete("{id}")]
    //[Authorize(Roles = "Teacher")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        if (!await CanManageCategoriesAsync())
            return Forbid();

        var deleted = await _categoryService.DeleteCategoryAsync(id);
    return deleted != null
        ? Ok(new { id = deleted.Id, name = deleted.Name })
        : NotFound();
    }

    private async Task<bool> CanReadCategoriesAsync()
    {
        if (!User.IsInRole("Assistant"))
            return true;

        return await assistantPermissions.HasAnyPermissionAsync(GetCurrentUserId());
    }

    private async Task<bool> CanManageCategoriesAsync()
    {
        if (!User.IsInRole("Assistant"))
            return true;

        return await assistantPermissions.HasAnyManageCourseContentAsync(GetCurrentUserId());
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }
}
