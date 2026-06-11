using System.ComponentModel.DataAnnotations;
using System.Text;
using List.Courses.Data;
using List.Courses.DTOs;
using List.Courses.Models;
using List.Users.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic.FileIO;

namespace List.Courses.Controllers;

[ApiController]
[Route("api/user-import")]
[Authorize(Roles = "Teacher")]
public class UserImportController(CoursesDbContext context) : ControllerBase
{
    private const long MaxFileSize = 5 * 1024 * 1024;
    private const int MaxRows = 5000;
    private const int MaxColumns = 100;

    [HttpPost("preview")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> Preview(
        [FromForm] IFormFile file,
        [FromForm] string delimiter = "auto",
        [FromForm] bool hasHeader = true)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Vyber CSV subor.");

        if (file.Length > MaxFileSize)
            return BadRequest("CSV subor je prilis velky. Maximalna velkost je 5 MB.");

        if (!string.Equals(Path.GetExtension(file.FileName), ".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Subor musi mat priponu .csv.");

        string content;
        await using (var stream = file.OpenReadStream())
        using (var reader = new StreamReader(stream, Encoding.UTF8, true))
        {
            content = await reader.ReadToEndAsync();
        }

        if (string.IsNullOrWhiteSpace(content))
            return BadRequest("CSV subor je prazdny.");

        var delimiterCharacter = ResolveDelimiter(delimiter, content);
        var result = ParsePreview(content, delimiterCharacter, hasHeader);

        return Ok(result);
    }

    [HttpPost("execute")]
    public async Task<IActionResult> Execute([FromBody] ExecuteUserImportDto dto)
    {
        if (dto.Rows == null || dto.Rows.Count == 0)
            return BadRequest("Nie su vybrane ziadne riadky na import.");

        if (dto.Rows.Count > MaxRows)
            return BadRequest($"Naraz je mozne importovat najviac {MaxRows} riadkov.");

        if (dto.GroupId.HasValue && !dto.CourseId.HasValue)
            return BadRequest("Skupinu je mozne vybrat iba spolu s kurzom.");

        Course? course = null;
        CourseGroup? group = null;
        var approvedCourseCount = 0;
        var approvedGroupCount = 0;

        if (dto.CourseId.HasValue)
        {
            course = await context.Courses
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == dto.CourseId.Value);

            if (course == null)
                return BadRequest("Vybrany kurz neexistuje.");

            approvedCourseCount = course.Participants.Count(p => p.Allowed);
        }

        if (dto.GroupId.HasValue)
        {
            group = await context.Groups
                .Include(g => g.Rooms)
                .Include(g => g.Participants)
                .FirstOrDefaultAsync(g => g.Id == dto.GroupId.Value);

            if (group == null || group.CourseId != dto.CourseId)
                return BadRequest("Vybrana skupina nepatri do zvoleneho kurzu.");

            approvedGroupCount = group.Participants.Count(p => p.Allowed);
        }

        var result = new UserImportResultDto();
        var importedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var emailValidator = new EmailAddressAttribute();

        foreach (var row in dto.Rows.OrderBy(r => r.RowNumber))
        {
            var firstName = row.FirstName?.Trim() ?? string.Empty;
            var lastName = row.LastName?.Trim() ?? string.Empty;
            var email = row.Email?.Trim().ToLowerInvariant() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(firstName) ||
                string.IsNullOrWhiteSpace(lastName) ||
                string.IsNullOrWhiteSpace(email))
            {
                AddFailure(result, row.RowNumber, email, "Meno, priezvisko a email musia byt vyplnene.");
                continue;
            }

            if (!emailValidator.IsValid(email))
            {
                AddFailure(result, row.RowNumber, email, "Email nema platny format.");
                continue;
            }

            if (!importedEmails.Add(email))
            {
                AddFailure(result, row.RowNumber, email, "Email sa v importe nachadza viackrat.");
                continue;
            }

            try
            {
                var user = await context.Set<User>()
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

                var userCreated = false;
                if (user == null)
                {
                    user = new User
                    {
                        Fullname = $"{firstName} {lastName}",
                        Email = email,
                        Password = BCrypt.Net.BCrypt.HashPassword("temp"),
                        Role = UserRole.Student
                    };

                    context.Set<User>().Add(user);
                    await context.SaveChangesAsync();
                    userCreated = true;
                    result.CreatedUsers++;
                }
                else
                {
                    result.ExistingUsers++;
                }

                if (course == null)
                {
                    result.Rows.Add(new UserImportRowResultDto
                    {
                        RowNumber = row.RowNumber,
                        Email = email,
                        Status = userCreated ? "created" : "existing",
                        Message = userCreated ? "Pouzivatel bol vytvoreny." : "Pouzivatel uz existuje."
                    });
                    continue;
                }

                if (user.Role != UserRole.Student)
                {
                    AddFailure(result, row.RowNumber, email,
                        "Pouzivatel uz existuje, ale nema rolu Student. Do kurzu nebol pridany.");
                    continue;
                }

                var existingParticipant = await context.Participants
                    .AnyAsync(p => p.CourseId == course.Id && p.UserId == user.Id);

                if (existingParticipant)
                {
                    result.ExistingParticipants++;
                    result.Rows.Add(new UserImportRowResultDto
                    {
                        RowNumber = row.RowNumber,
                        Email = email,
                        Status = "existing",
                        Message = "Pouzivatel uz je ucastnikom vybraneho kurzu."
                    });
                    continue;
                }

                if (dto.Allowed && approvedCourseCount >= course.Capacity)
                {
                    AddFailure(result, row.RowNumber, email,
                        "Pouzivatel bol vytvoreny alebo uz existuje, ale kurz je plny.");
                    continue;
                }

                var groupCapacity = group?.Rooms.Sum(r => r.Capacity) ?? 0;
                if (dto.Allowed && group != null && groupCapacity > 0 && approvedGroupCount >= groupCapacity)
                {
                    AddFailure(result, row.RowNumber, email,
                        "Pouzivatel bol vytvoreny alebo uz existuje, ale skupina je plna.");
                    continue;
                }

                context.Participants.Add(new Participant
                {
                    CourseId = course.Id,
                    UserId = user.Id,
                    Allowed = dto.Allowed,
                    GroupId = group?.Id
                });

                await context.SaveChangesAsync();

                if (dto.Allowed)
                {
                    approvedCourseCount++;
                    if (group != null)
                        approvedGroupCount++;
                }

                result.AddedParticipants++;
                result.Rows.Add(new UserImportRowResultDto
                {
                    RowNumber = row.RowNumber,
                    Email = email,
                    Status = "imported",
                    Message = group != null
                        ? $"Pouzivatel bol pridany do kurzu a skupiny {group.Name}."
                        : "Pouzivatel bol pridany do kurzu."
                });
            }
            catch
            {
                AddFailure(result, row.RowNumber, email, "Riadok sa nepodarilo importovat.");
                context.ChangeTracker.Clear();
            }
        }

        return Ok(result);
    }

    private static UserImportPreviewDto ParsePreview(string content, char delimiter, bool hasHeader)
    {
        var parsedRows = new List<UserImportPreviewRowDto>();
        var errors = new List<UserImportPreviewErrorDto>();
        var headerValues = new List<string>();
        var truncated = false;
        var firstRow = true;

        var bytes = Encoding.UTF8.GetBytes(content);
        using var stream = new MemoryStream(bytes);
        using var parser = new TextFieldParser(stream, Encoding.UTF8, false)
        {
            TextFieldType = FieldType.Delimited,
            HasFieldsEnclosedInQuotes = true,
            TrimWhiteSpace = false
        };
        parser.SetDelimiters(delimiter.ToString());

        while (!parser.EndOfData)
        {
            var rowNumber = (int)parser.LineNumber;
            string[]? values;

            try
            {
                values = parser.ReadFields();
            }
            catch (MalformedLineException)
            {
                errors.Add(new UserImportPreviewErrorDto
                {
                    RowNumber = (int)parser.ErrorLineNumber,
                    Message = "Riadok sa nepodarilo spracovat."
                });
                continue;
            }

            if (values == null || values.All(string.IsNullOrWhiteSpace))
                continue;

            if (values.Length > MaxColumns)
            {
                errors.Add(new UserImportPreviewErrorDto
                {
                    RowNumber = rowNumber,
                    Message = $"Riadok obsahuje viac ako {MaxColumns} stlpcov."
                });
                continue;
            }

            if (firstRow && hasHeader)
            {
                headerValues = values.Select(value => value.Trim()).ToList();
                firstRow = false;
                continue;
            }

            firstRow = false;
            if (parsedRows.Count >= MaxRows)
            {
                truncated = true;
                break;
            }

            parsedRows.Add(new UserImportPreviewRowDto
            {
                RowNumber = rowNumber,
                Values = values.Select(value => value.Trim()).ToList()
            });
        }

        var columnCount = Math.Max(
            headerValues.Count,
            parsedRows.Count == 0 ? 0 : parsedRows.Max(row => row.Values.Count));

        var headers = Enumerable.Range(0, columnCount)
            .Select(index =>
                index < headerValues.Count && !string.IsNullOrWhiteSpace(headerValues[index])
                    ? headerValues[index]
                    : $"Stlpec {index + 1}")
            .ToList();

        foreach (var row in parsedRows)
        {
            while (row.Values.Count < columnCount)
                row.Values.Add(string.Empty);
        }

        return new UserImportPreviewDto
        {
            Delimiter = DelimiterName(delimiter),
            HasHeader = hasHeader,
            Headers = headers,
            Rows = parsedRows,
            Errors = errors,
            Truncated = truncated
        };
    }

    private static char ResolveDelimiter(string delimiter, string content)
    {
        return delimiter?.ToLowerInvariant() switch
        {
            "semicolon" => ';',
            "comma" => ',',
            "tab" => '\t',
            _ => DetectDelimiter(content)
        };
    }

    private static char DetectDelimiter(string content)
    {
        var lines = content
            .Split(new[] { "\r\n", "\n", "\r" }, StringSplitOptions.RemoveEmptyEntries)
            .Take(10)
            .ToList();

        var candidates = new[] { ';', ',', '\t' };
        return candidates
            .Select(candidate => new
            {
                Delimiter = candidate,
                Score = lines.Sum(line => CountOutsideQuotes(line, candidate))
            })
            .OrderByDescending(candidate => candidate.Score)
            .FirstOrDefault(candidate => candidate.Score > 0)?.Delimiter ?? ';';
    }

    private static int CountOutsideQuotes(string line, char delimiter)
    {
        var count = 0;
        var inQuotes = false;

        for (var index = 0; index < line.Length; index++)
        {
            if (line[index] == '"')
            {
                if (inQuotes && index + 1 < line.Length && line[index + 1] == '"')
                {
                    index++;
                    continue;
                }

                inQuotes = !inQuotes;
            }
            else if (!inQuotes && line[index] == delimiter)
            {
                count++;
            }
        }

        return count;
    }

    private static string DelimiterName(char delimiter)
    {
        return delimiter switch
        {
            ',' => "comma",
            '\t' => "tab",
            _ => "semicolon"
        };
    }

    private static void AddFailure(UserImportResultDto result, int rowNumber, string email, string message)
    {
        result.FailedRows++;
        result.Rows.Add(new UserImportRowResultDto
        {
            RowNumber = rowNumber,
            Email = email,
            Status = "error",
            Message = message
        });
    }
}
