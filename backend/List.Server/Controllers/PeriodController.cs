using Microsoft.AspNetCore.Mvc;
using List.Server.Data;
using List.Server.Data.DTOs;
using List.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;




namespace List.Server.Controllers
{
    [ApiController]
    [Route("api/periods")]
    public class PeriodController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PeriodController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var periods = await _context.Periods
                .Select(p => new PeriodReadDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    CourseCount = p.Courses.Count()
                })
                .ToListAsync();

            return Ok(periods);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Create(PeriodCreateDto dto)
        {
            var period = new Period { Name = dto.Name };
            _context.Periods.Add(period);
            await _context.SaveChangesAsync();
            return Ok(period);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var period = await _context.Periods.FindAsync(id);
            if (period == null) return NotFound();

            _context.Periods.Remove(period);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
