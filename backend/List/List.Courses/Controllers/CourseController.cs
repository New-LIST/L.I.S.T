using Microsoft.AspNetCore.Mvc;
using List.Courses.Data;
using List.Courses.DTOs;
using List.Courses.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace List.Courses.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CourseController : ControllerBase
    {
        private readonly CoursesDbContext _context;

        public CourseController(CoursesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rawCourses = await _context.Courses
                .Include(c => c.Period)
                .Select(c => new CourseReadDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    PeriodName = c.Period != null ? c.Period.Name : "—",
                    Capacity = c.Capacity,
                    GroupChangeDeadline = c.GroupChangeDeadline,
                    EnrollmentLimit = c.EnrollmentLimit,
                    HiddenInList = c.HiddenInList,
                    AutoAcceptStudents = c.AutoAcceptStudents
                })
                .ToListAsync();

            foreach (var c in rawCourses)
            {
                if (c.GroupChangeDeadline.HasValue)
                    c.GroupChangeDeadline = DateTime.SpecifyKind(c.GroupChangeDeadline.Value, DateTimeKind.Utc);

                if (c.EnrollmentLimit.HasValue)
                    c.EnrollmentLimit = DateTime.SpecifyKind(c.EnrollmentLimit.Value, DateTimeKind.Utc);
            }

            return Ok(rawCourses);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Create(CourseCreateDto dto)
        {
            var course = new Course
            {
                Name = dto.Name,
                PeriodId = dto.PeriodId,
                Capacity = dto.Capacity,
                GroupChangeDeadline = dto.GroupChangeDeadline?.ToUniversalTime(),
                EnrollmentLimit = dto.EnrollmentLimit?.ToUniversalTime(),
                HiddenInList = dto.HiddenInList,
                AutoAcceptStudents = dto.AutoAcceptStudents
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok(course);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Update(int id, [FromBody] CourseCreateDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            course.Name = dto.Name;
            course.PeriodId = dto.PeriodId;
            course.Capacity = dto.Capacity;
            course.GroupChangeDeadline = dto.GroupChangeDeadline?.ToUniversalTime();
            course.EnrollmentLimit = dto.EnrollmentLimit?.ToUniversalTime();
            course.HiddenInList = dto.HiddenInList;
            course.AutoAcceptStudents = dto.AutoAcceptStudents;

            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
