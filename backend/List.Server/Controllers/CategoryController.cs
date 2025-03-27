
using List.Server.Data;
using List.Server.Data.Models;
using List.Server.Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        private CategoryDto MapCategory(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Children = category.Children?.Select(MapCategory).ToList() ?? new()
            };
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var allCategories = await _context.Categories
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
                        Children = BuildTree(c.Id)
                    })
                    .ToList();
            }

            var rootCategories = BuildTree(null);
            return Ok(rootCategories);
        }

        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            // Optional: validate parent existence
            if (category.ParentId != null)
            {
                var parentExists = await _context.Categories.AnyAsync(c => c.Id == category.ParentId);
                if (!parentExists)
                {
                    return BadRequest("Parent category does not exist.");
                }
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            category.Name = dto.Name;
            category.ParentId = dto.ParentId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
