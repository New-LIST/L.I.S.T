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
    [Route("api/participants")]
    public class ParticipantController : ControllerBase
    {
        private readonly CoursesDbContext _context;

        public ParticipantController(CoursesDbContext context)
        {
            _context = context;
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var myCourses = await _context.Participants
                .Where(p => p.UserId == userId)
                .Select(p => new {
                    CourseId = p.CourseId,
                    Allowed = p.Allowed
                })
                .ToListAsync();

            return Ok(myCourses);
        }

        [HttpPost]
        public async Task<IActionResult> JoinCourse([FromBody] ParticipantCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var course = await _context.Courses
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == dto.CourseId);

            if (course == null)
                return NotFound("Kurz neexistuje.");

            if (course.EnrollmentLimit.HasValue && DateTime.UtcNow > course.EnrollmentLimit.Value)
                return BadRequest("Zápis do kurzu bol ukončený.");

            var enrolledCount = course.Participants.Count(p => p.Allowed);
            if (enrolledCount >= course.Capacity)
                return BadRequest("Kurz je plný.");

            var alreadyParticipant = await _context.Participants
                .AnyAsync(p => p.CourseId == dto.CourseId && p.UserId == userId);

            if (alreadyParticipant)
                return BadRequest("Už si prihlásený v tomto kurze.");

            var participant = new Participant
            {
                CourseId = dto.CourseId,
                UserId = userId,
                Allowed = course.AutoAcceptStudents
            };

            _context.Participants.Add(participant);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                courseId = course.Id,
                allowed = participant.Allowed
            });
        }
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetParticipantsByCourse(int courseId)
        {
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);
            if (!courseExists)
                return NotFound("Kurz neexistuje.");

            var participants = await _context.Participants
                .Where(p => p.CourseId == courseId)
                .Include(p => p.User)
                .Select(p => new
                {
                    UserId = p.UserId,
                    UserName = p.User.Fullname,
                    Email = p.User.Email,
                    Allowed = p.Allowed
                })
                .ToListAsync();

            return Ok(participants);
        }
        [HttpPatch("approve")]
        public async Task<IActionResult> ApproveParticipant([FromBody] ParticipantUpdateDto dto)
        {
            var participant = await _context.Participants
                .Include(p => p.Course)
                .Where(p => p.CourseId == dto.CourseId && p.UserId == dto.UserId)
                .FirstOrDefaultAsync();

            if (participant == null)
                return NotFound("Účastník neexistuje.");

            var enrolledCount = await _context.Participants
                .CountAsync(p => p.CourseId == dto.CourseId && p.Allowed);

            if (enrolledCount >= participant.Course.Capacity)
                return BadRequest("Kapacita kurzu je plná. Nemôžeš schváliť ďalšieho účastníka.");

            participant.Allowed = true;
            await _context.SaveChangesAsync();

            return Ok();
        }


        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveParticipant([FromQuery] int courseId, [FromQuery] int userId)
        {
            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.CourseId == courseId && p.UserId == userId);

            if (participant == null)
                return NotFound("Účastník neexistuje.");

            _context.Participants.Remove(participant);
            await _context.SaveChangesAsync();

            return Ok();
        }

    }


}