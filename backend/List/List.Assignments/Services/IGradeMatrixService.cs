using List.Assignments.Models;
using List.Assignments.DTOs;
using List.Common.Files;
using Microsoft.AspNetCore.Http;

namespace List.Assignments.Services;

public interface IGradeMatrixService
{
    Task<GradeMatrixDto> GetGradeMatrixAsync(int courseId);
}