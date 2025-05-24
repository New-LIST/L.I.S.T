using List.Assignments.Models;
using List.Assignments.DTOs;
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
    Task<List<SolutionVersionModel>> GetVersionsBySolutionIdAsync(int solutionId);
    Task<MemoryStream> DownloadAllSolutionsAsync(int assignmentId);
    Task UpdateSolutionInfoAsync(int assignmentId, int solutionId, SolutionInfoDto dto);
    Task<List<BulkGradeItemDto>> GetBulkGradeItemsAsync(int assignmentId);
    Task SaveBulkGradesAsync(int assignmentId, List<BulkGradeSaveDto> items);
    Task<List<SubmissionOverviewDto>> GetSubmissionOverviewsAsync(int assignmentId);
    Task<EvaluationHeaderDto> GetEvaluationHeaderAsync(int assignmentId, int solutionId);
    Task<SolutionInfoDto> GetSolutionInfoAsync(int assignmentId, int solutionId);
    Task<List<string>?> GetFilesListAsync(int solutionId, int version);
    Task<Stream?> GetFileContentAsync(int solutionId, int version, string filePath);
}