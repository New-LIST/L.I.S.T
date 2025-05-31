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

        public CourseController(CoursesDbContext context)
        {
            _context = context;
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
                    Description = c.Description
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

        [HttpGet("student-visible")]
        public async Task<IActionResult> GetVisibleToStudents()
        {
            var visibleCourses = await _context.Courses
                .Where(c => !c.HiddenInList)
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
                    CurrentEnrollment = c.Participants.Count(p => p.Allowed),
                    Description = c.Description
                })
                .ToListAsync();

            foreach (var c in visibleCourses)
            {
                if (c.GroupChangeDeadline.HasValue)
                    c.GroupChangeDeadline = DateTime.SpecifyKind(c.GroupChangeDeadline.Value, DateTimeKind.Utc);

                if (c.EnrollmentLimit.HasValue)
                    c.EnrollmentLimit = DateTime.SpecifyKind(c.EnrollmentLimit.Value, DateTimeKind.Utc);
            }

            return Ok(visibleCourses);
        }

        [HttpGet("teacherId")]
        public async Task<IActionResult> GetCoursesByTeacherId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (claim == null)
                return Unauthorized("Chýba identifikátor používateľa.");
            var teacherId = int.Parse(claim.Value);
            var courses = await _context.Courses
                .Where(c => c.TeacherId == teacherId)
                .Select(c => new {
                    c.Id,
                    c.Name,
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpGet("{courseId}/courseName")]
        public async Task<IActionResult> GetCourseName(int courseId)
        {
            var c = await _context.Courses
                .Where(x => x.Id == courseId)
                .Select(x => new { x.Id, x.Name })
                .FirstOrDefaultAsync();
            if (c == null) return NotFound();
            return Ok(c);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Period)
                .Include(c => c.Teacher)
                .Where(c => c.Id == id)
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
                    Description = c.Description
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound();

            if (course.GroupChangeDeadline.HasValue)
                course.GroupChangeDeadline = DateTime.SpecifyKind(course.GroupChangeDeadline.Value, DateTimeKind.Utc);

            if (course.EnrollmentLimit.HasValue)
                course.EnrollmentLimit = DateTime.SpecifyKind(course.EnrollmentLimit.Value, DateTimeKind.Utc);

            return Ok(course);
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
                TeacherId = teacherId,
                Description = dto.Description
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();


            var userId = User.Identity?.Name ?? "anonymous";

            return Ok(new { id = course.Id, name = course.Name });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { id = course.Id, name = course.Name });
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
            course.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new { id = course.Id, name = course.Name }); ;
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

        [HttpPut("{id}/description")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateDescription(int id, [FromBody] CourseDescriptionDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            course.Description = dto.Description;
            await _context.SaveChangesAsync();

            return NoContent();
        }


                
    }
}
