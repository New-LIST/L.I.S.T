using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace List.Common.Files;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string folder);
    Task DeleteFileAsync(string relativePath);
    Task<string> SaveFileAsync(IFormFile file, string folder, string fileName);
}