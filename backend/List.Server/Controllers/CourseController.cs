using Microsoft.AspNetCore.Mvc;
using List.Server.Data;
using List.Server.Data.DTOs;
using List.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Server.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CourseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CourseController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _context.Courses
                .Include(c => c.Period)
                .Select(c => new CourseReadDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    PeriodName = c.Period.Name
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CourseCreateDto dto)
        {
            var course = new Course
            {
                Name = dto.Name,
                PeriodId = dto.PeriodId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok(course);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
