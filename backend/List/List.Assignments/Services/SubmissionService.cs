using List.Assignments.Data;
using List.Courses.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Common.Files;
using List.Logs.Services;
using System.IO;
using System.IO.Compression;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

using Microsoft.EntityFrameworkCore;


namespace List.Assignments.Services;

public class SubmissionService : ISubmissionService
{
    private readonly AssignmentsDbContext _db;

    private readonly CoursesDbContext _coursesDb;
    private readonly IFileStorageService _files;

    public SubmissionService(AssignmentsDbContext db, CoursesDbContext coursesDb, IFileStorageService files)
    {
        _db = db;
        _coursesDb = coursesDb;
        _files = files;
    }

    public async Task<SolutionVersionModel> AddVersionAsync(
        int assignmentId,
        int studentId,
        IFormFile zipFile,
        string ipAddress,
        string? comment = null
    )
    {
        // 1) Najprv nájdeme alebo vytvoríme SolutionModel
        var solution = await _db.Solutions
            .Include(s => s.Versions)
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s =>
                 s.AssignmentId == assignmentId
              && s.StudentId == studentId);

        if (solution == null)
        {
            var assignment = await _db.Assignments
               .AsNoTracking()
               .FirstOrDefaultAsync(a => a.Id == assignmentId)
               ?? throw new KeyNotFoundException("Assignment nenájdené");

            solution = new SolutionModel
            {
                AssignmentId = assignmentId,
                StudentId = studentId,
                TeacherId = assignment.TeacherId,          // prípadne nastaviteľné z kontextu
                Created = DateTime.UtcNow,
                Updated = DateTime.UtcNow,
                TestsPoints = 0,
                Revalidate = false,
                NotConsidered = false,
                IpAddress = ipAddress,
                DisableEvaluationByTests = true,
                BestVersion = 0,
                Points = null,
            };
            _db.Solutions.Add(solution);
            await _db.SaveChangesAsync();

            solution = await _db.Solutions
            .Include(s => s.Versions)
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .FirstAsync(s => s.Id == solution.Id);
        }

        // 2) Spočítame next version
        var nextVer = solution.Versions.Any()
            ? solution.Versions.Max(v => v.Version) + 1
            : 1;

        // 3) Uložíme ZIP cez FileStorageService
        var rawName = solution.Student.Fullname;
        var safeName = SanitizeFileName(rawName);
        var folder = $"courses/{solution.Assignment.CourseId}/tasksets/{solution.Assignment.TaskSetTypeId}/assignments/{assignmentId}/students/{safeName}";
        using var memStream = new MemoryStream();
        using (var archive = new ZipArchive(memStream, ZipArchiveMode.Create, true))
        {
            // v zip-e bude entry s originálnym menom a obsahom
            var entry = archive.CreateEntry(zipFile.FileName, CompressionLevel.Optimal);
            using var entryStream = entry.Open();
            await zipFile.CopyToAsync(entryStream);
        }
        memStream.Position = 0;

        // 3a) Vytvoríme nový IFormFile pre upload zipu
        var zipFileName = $"{safeName}_{nextVer}.zip";
        var zippedFormFile = new FormFile(memStream, 0, memStream.Length, zipFile.Name, zipFileName)
        {
            Headers = new HeaderDictionary(new Dictionary<string, StringValues> {
            { "Content-Type", "application/zip" }
        }),
            ContentType = "application/zip"
        };

        // 3b) Uložíme v pamäti zip pomocou FileStorageService
        var storageKey = await _files.SaveFileAsync(zippedFormFile, folder, zipFileName);

        // 4) Vytvoríme SolutionVersionModel
        var ver = new SolutionVersionModel
        {
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow,
            SolutionId = solution.Id,
            Version = nextVer,
            DownloadLock = false,
            IpAddress = ipAddress,    // ak potrebuješ, môžeš dosadiť z HttpContext
            Comment = comment,
            StorageKey = storageKey
        };
        _db.SolutionVersions.Add(ver);

        // 5) Aktualizujeme best version a timestamp v SolutionModel
        solution.BestVersion = nextVer;
        solution.Updated = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ver;
    }
    public async Task<List<SolutionModel>> GetAllSolutionsAsync()
    {
        return await _db.Solutions
            .Include(s => s.Student)       // ak chceš poslať meno študenta
            .ToListAsync();
    }

    public async Task<List<SolutionVersionModel>> GetVersionsBySolutionIdAsync(int solutionId)
    {
        return await _db.SolutionVersions
            .Where(v => v.SolutionId == solutionId)
            .OrderBy(v => v.Version)
            .ToListAsync();
    }

    private static string SanitizeFileName(string input)
    {
        // 1) Normalizuj na dekomponovanú formu (NFD)
        var normalized = input.Normalize(NormalizationForm.FormD);

        // 2) Odstráň všetky kombinujúce diakritické značky
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var cat = CharUnicodeInfo.GetUnicodeCategory(c);
            if (cat != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        // 3) Zrýchli späť na kompozitnú formu (NFC)
        var noDiacritics = sb.ToString().Normalize(NormalizationForm.FormC);

        // 4) Odstráň medzery a všetky nepísmenkové/číslicové znaky
        //    (ponecháme len A–Z, a–z, 0–9, podčiarkovník a pomlčku)
        var cleaned = Regex.Replace(noDiacritics, @"[^A-Za-z0-9_-]+", "");

        return cleaned;
    }

    public async Task<MemoryStream> DownloadAllSolutionsAsync(int assignmentId)
    {
        // 1) Načítaj všetky verzie k riešeniam, ktoré patria pod dané assignment
        var versions = await _db.SolutionVersions
            .Include(v => v.Solution)
                .ThenInclude(s => s.Student)
            .Where(v => v.Solution.AssignmentId == assignmentId)
            .ToListAsync();

        // 2) Vytvorím ZIP v pamäti
        var zipStream = new MemoryStream();
        using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var v in versions)
            {
                try
                {
                    using var fileStream = await _files.GetFileStreamAsync(v.StorageKey);

                    var rawName = v.Solution.Student.Fullname;
                    var safeName = SanitizeFileName(rawName);
                    var ext = Path.GetExtension(v.StorageKey);
                    var entryName = $"{safeName}_{v.Version}{ext}";

                    var entry = archive.CreateEntry(entryName, CompressionLevel.Fastest);
                    using var entryStream = entry.Open();
                    await fileStream.CopyToAsync(entryStream);
                }
                catch (FileNotFoundException ex)
                {
                    // ak súbor chýba, len zalogujeme a pokračujeme
                    Console.WriteLine("Preskakujem chýbajúci súbor" + v.StorageKey + " : " + ex.Message);
                }
            }
        }

        // 6) Posuň pozíciu na začiatok pre čítanie
        zipStream.Position = 0;
        return zipStream;
    }

    public async Task<List<BulkGradeItemDto>> GetBulkGradeItemsAsync(int assignmentId)
    {
        // 1) Zisti courseId z assignment
        var assignment = await _db.Assignments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException($"Assignment {assignmentId} not found.");

        // 2) Načítaj participantov z kurzu
        var participants = await _coursesDb.Participants
            .Where(p => p.CourseId == assignment.CourseId && p.Allowed)
            .Include(p => p.User)
            .ToListAsync();

        // 3) Načítaj existujúce solutions
        var solutions = await _db.Solutions
            .Where(s => s.AssignmentId == assignmentId)
            .ToListAsync();

        // 4) Zostav DTO
        var items = participants.Select(p =>
        {
            var sol = solutions.FirstOrDefault(s => s.StudentId == p.UserId);
            return new BulkGradeItemDto
            {
                StudentId = p.UserId,
                FullName = p.User.Fullname,
                Email = p.User.Email,
                Points = sol?.Points
            };
        }).ToList();

        return items;
    }

    public async Task SaveBulkGradesAsync(int assignmentId, List<BulkGradeSaveDto> items)
    {
        // 1) Načítaj assignment, aby si mal teacherId
        var assignment = await _db.Assignments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException($"Assignment {assignmentId} not found.");

        // 2) Iteruj položky a buď aktualizuj, alebo vytvor SolutionModel
        foreach (var dto in items)
        {
            var sol = await _db.Solutions
                .FirstOrDefaultAsync(s =>
                    s.AssignmentId == assignmentId &&
                    s.StudentId == dto.StudentId);

            if (sol == null)
            {
                sol = new SolutionModel
                {
                    AssignmentId = assignmentId,
                    StudentId = dto.StudentId,
                    TeacherId = assignment.TeacherId,
                    Created = DateTime.UtcNow,
                    Updated = DateTime.UtcNow,
                    TestsPoints = 0,
                    Revalidate = false,
                    NotConsidered = false,
                    DisableEvaluationByTests = true,
                    BestVersion = 0,
                    Points = dto.Points
                };
                _db.Solutions.Add(sol);
            }
            else
            {
                sol.Points = dto.Points;
            }
        }

        await _db.SaveChangesAsync();
    }


    public async Task<List<SubmissionOverviewDto>> GetSubmissionOverviewsAsync(int assignmentId)
    {
        // 1) Načítaj assignment, aby si mal courseId
        var assignment = await _db.Assignments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException($"Assignment {assignmentId} not found");

        // 2) Načítaj všetky SolutionModel pre toto zadanie + navigácie
        var solutions = await _db.Solutions
            .Where(s => s.AssignmentId == assignmentId)
            .Include(s => s.Student)
            .Include(s => s.Versions)
            .ToListAsync();

        // 3) Načítaj participants, aby si získal Group
        var participants = await _coursesDb.Participants
            .Where(p => p.CourseId == assignment.CourseId && p.Allowed)
            .Include(p => p.User)
            .ToListAsync();

        // 4) Zlož výsledné DTO
        var list = solutions.Select(s =>
        {
            var p = participants.FirstOrDefault(x => x.UserId == s.StudentId);
            var lastVersion = s.Versions
                .OrderByDescending(v => v.Version)
                .FirstOrDefault();

            return new SubmissionOverviewDto
            {
                SolutionId = s.Id,
                Created = s.Created,
                Updated = s.Updated,
                FullName = s.Student.Fullname,
                Email = s.Student.Email,
                Group = "-",
                VersionsCount = s.Versions.Count,
                LastIpAddress = lastVersion?.IpAddress,
                Points = s.Points
            };
        }).ToList();

        return list;
    }


    public async Task<EvaluationHeaderDto> GetEvaluationHeaderAsync(int assignmentId, int solutionId)
    {
        var sol = await _db.Solutions
            .Include(s => s.Assignment).ThenInclude(a => a.Course)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s =>
                s.Id == solutionId &&
                s.AssignmentId == assignmentId)
            ?? throw new KeyNotFoundException($"Solution {solutionId} not found.");

        return new EvaluationHeaderDto
        {
            AssignmentName = sol.Assignment.Name,
            CourseName = sol.Assignment.Course.Name,
            StudentFullName = sol.Student.Fullname,
            StudentEmail = sol.Student.Email
        };
    }

    public async Task<SolutionInfoDto> GetSolutionInfoAsync(int assignmentId, int solutionId)
    {
        var sol = await _db.Solutions
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s =>
                s.Id == solutionId &&
                s.AssignmentId == assignmentId)
            ?? throw new KeyNotFoundException($"Solution {solutionId} not found.");

        var latest = sol.Versions
            .OrderByDescending(v => v.Version)
            .FirstOrDefault();

        return new SolutionInfoDto
        {
            TestsPoints = sol.TestsPoints,
            Points = sol.Points,
            Comment = latest?.Comment,
            Revalidate = sol.NotConsidered,
            DisableEvaluationByTests = sol.DisableEvaluationByTests
        };
    }


    public async Task UpdateSolutionInfoAsync(int assignmentId, int solutionId, SolutionInfoDto dto)
    {
        var sol = await _db.Solutions
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s =>
                s.Id == solutionId &&
                s.AssignmentId == assignmentId);

        if (sol == null)
            throw new KeyNotFoundException($"Solution {solutionId} not found.");

        // aktualizace bodů
        sol.Points = dto.Points;
        // (další pole, pokud bys chtěl)
        sol.NotConsidered = dto.Revalidate;
        sol.DisableEvaluationByTests = dto.DisableEvaluationByTests;
        sol.Updated = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task<List<string>?> GetFilesListAsync(int solutionId, int version)
    {
        // 1) Najdi storageKey verze podle solutionId + version čísla
        var key = await _db.SolutionVersions
            .Where(v => v.SolutionId == solutionId && v.Version == version)
            .Select(v => v.StorageKey)
            .FirstOrDefaultAsync();
        if (key == null) return null;

        // 2) Otevři zip a vrať názvy entry
        using var zipStream = await _files.GetFileStreamAsync(key);
        using var zip = new ZipArchive(zipStream, ZipArchiveMode.Read, false);
        return zip.Entries.Select(e => e.FullName).ToList();
    }

    public async Task<Stream?> GetFileContentAsync(int solutionId, int version, string filePath)
    {
        var key = await _db.SolutionVersions
            .Where(v => v.SolutionId == solutionId && v.Version == version)
            .Select(v => v.StorageKey)
            .FirstOrDefaultAsync();
        if (key == null) return null;

        using var zipStream = await _files.GetFileStreamAsync(key);
        using var zip = new ZipArchive(zipStream, ZipArchiveMode.Read, false);
        var entry = zip.Entries.FirstOrDefault(e => e.FullName == filePath);
        if (entry == null) return null;

        // Stream musí být vrácen otevřený; musíme ho zkopírovat do nového MemoryStream
        var ms = new MemoryStream();
        using var es = entry.Open();
        await es.CopyToAsync(ms);
        ms.Position = 0;
        return ms;
    }


}