using Microsoft.AspNetCore.Mvc;
using List.Courses.Data;
using List.Courses.DTOs;
using List.Courses.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using List.Common.Files;
using List.Logs.Services;
using Microsoft.AspNetCore.Http;

namespace List.Courses.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CourseController : ControllerBase
    {
        private readonly CoursesDbContext _context;
        private readonly ILogService _logService;

        public CourseController(CoursesDbContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rawCourses = await _context.Courses
                .Include(c => c.Period)
                .Include(c => c.Teacher)
                .Select(c => new CourseReadDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    PeriodName = c.Period != null ? c.Period.Name : "—",
                    Capacity = c.Capacity,
                    GroupChangeDeadline = c.GroupChangeDeadline,
                    EnrollmentLimit = c.EnrollmentLimit,
                    HiddenInList = c.HiddenInList,
                    AutoAcceptStudents = c.AutoAcceptStudents,
                    TeacherName = c.Teacher.Fullname,
                    ImageUrl = c.ImageUrl != null ? $"{Request.Scheme}://{Request.Host}/{c.ImageUrl}" : null,
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
            var teacherId = int.Parse(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var course = new Course
            {
                Name = dto.Name,
                PeriodId = dto.PeriodId,
                Capacity = dto.Capacity,
                GroupChangeDeadline = dto.GroupChangeDeadline?.ToUniversalTime(),
                EnrollmentLimit = dto.EnrollmentLimit?.ToUniversalTime(),
                HiddenInList = dto.HiddenInList,
                AutoAcceptStudents = dto.AutoAcceptStudents,
                TeacherId = teacherId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();


            var userId = User.Identity?.Name ?? "anonymous";
            await _logService.LogAsync(userId, "POST", "course", course.Id);

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

            var userId = User.Identity?.Name ?? "anonymous";
            await _logService.LogAsync(userId, "DELETE", "course", course.Id);

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

            var userId = User.Identity?.Name ?? "anonymous";
            await _logService.LogAsync(userId, "UPDATE", "course", course.Id);

            return NoContent();
        }

        [HttpPost("{id}/upload-image")]
        [Authorize(Roles = "Teacher")]
        [ApiExplorerSettings(IgnoreApi = true)]

        public async Task<IActionResult> UploadCourseImage(int id, [FromForm] IFormFile file, [FromServices] IFileStorageService fileStorageService)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (!string.IsNullOrEmpty(course.ImageUrl))
            {
                await fileStorageService.DeleteFileAsync(course.ImageUrl);
            }

            var relativePath = await fileStorageService.SaveFileAsync(file, "courses"); // /uploads/courses/...
            course.ImageUrl = relativePath.Replace("\\", "/");
            await _context.SaveChangesAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fullUrl = $"{baseUrl}/{course.ImageUrl}";

            return Ok(new { imageUrl = fullUrl });
        }

    }
}
