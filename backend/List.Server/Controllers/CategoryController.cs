
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
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var rootCategories = await _context.Categories
                .Where(c => c.ParentId == null)
                .Include(c => c.Children)
                .ToListAsync();

            var result = rootCategories.Select(MapCategory).ToList();
            return Ok(result);
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
    }
}
