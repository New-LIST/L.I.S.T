
using List.Server.Data;
using List.Server.Data.Models;
using List.Server.Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] CategoryDto dto)
        {
            // Optional: validate parent existence
            if (dto.ParentId != null)
            {
                var parentExists = await _context.Categories.AnyAsync(c => c.Id == dto.ParentId);
                if (!parentExists)
                {
                    return BadRequest("Parent category does not exist.");
                }
            }

            var duplicateExists = await _context.Categories.AnyAsync(c =>
                c.Name.ToLower() == dto.Name.ToLower() &&
                ((c.ParentId == null && dto.ParentId == null) || c.ParentId == dto.ParentId));

            if (duplicateExists)
                return BadRequest("V rámci tejto nadkategórie už existuje rovnaká kategória.");

            var category = new Category
            {
                Name = dto.Name,
                ParentId = dto.ParentId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            var duplicateExists = await _context.Categories.AnyAsync(c =>
                c.Id != id &&
                c.Name.ToLower() == dto.Name.ToLower() &&
                ((c.ParentId == null && dto.ParentId == null) || c.ParentId == dto.ParentId));

            if (duplicateExists)
                return BadRequest("V rámci tejto nadkategórie už existuje rovnaká kategória.");

            category.Name = dto.Name;
            category.ParentId = dto.ParentId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/category/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
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
