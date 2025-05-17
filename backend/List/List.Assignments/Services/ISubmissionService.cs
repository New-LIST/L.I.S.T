using List.Assignments.Models;
using List.Common.Files;
using Microsoft.AspNetCore.Http;

namespace List.Assignments.Services;

public interface ISubmissionService
{
    Task<SolutionVersionModel> AddVersionAsync(
        int assignmentId,
        int studentId,
        IFormFile zipFile,
        string ipAddress,
        string? comment = null
        );
        
    Task<List<SolutionModel>> GetAllSolutionsAsync();

    // vráti zoznam všetkých version pre dané solutionId
    Task<List<SolutionVersionModel>> GetVersionsBySolutionIdAsync(int solutionId);
}