using List.Assignments.Data;
using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Common.Files;
using List.Logs.Services;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

using Microsoft.EntityFrameworkCore;


namespace List.Assignments.Services;

public class SubmissionService : ISubmissionService
{
    private readonly AssignmentsDbContext _db;
    private readonly IFileStorageService _files;

    public SubmissionService(AssignmentsDbContext db, IFileStorageService files)
    {
        _db = db;
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
        }

        // 2) Spočítame next version
        var nextVer = solution.Versions.Any()
            ? solution.Versions.Max(v => v.Version) + 1
            : 1;

        // 3) Uložíme ZIP cez FileStorageService
        var rawName = solution.Student.Fullname;
        var safeName = SanitizeFileName(rawName);
        var folder = $"courses/{solution.Assignment.CourseId}/tasksets/{solution.Assignment.TaskSetTypeId}/assignments/{assignmentId}/students/{safeName}";
        var ext = Path.GetExtension(zipFile.FileName);
        var fileName = $"{safeName}_{nextVer}{ext}";
        var storageKey = await _files.SaveFileAsync(zipFile, folder, fileName);

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

}