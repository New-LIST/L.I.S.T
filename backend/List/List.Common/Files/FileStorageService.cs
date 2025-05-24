using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace List.Common.Files;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public FileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", folder);
        Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Path.Combine("uploads", folder, fileName).Replace("\\", "/");
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder, string fileName)
    {
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", folder);
        Directory.CreateDirectory(uploadsFolder);

        // tu používame presne fileName bez ďalšej GUID generácie
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Path.Combine("uploads", folder, fileName).Replace("\\", "/");
    }

    public Task DeleteFileAsync(string relativePath)
    {
        var fullPath = Path.Combine(_env.WebRootPath, relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }

    public Task<Stream> GetFileStreamAsync(string relativePath)
    {
        // zložíme absolutnú cestu
        var segments = relativePath.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);

        // 2) combine WebRootPath + all those segments
        var fullPath = Path.Combine(
            new[] { _env.WebRootPath }
            .Concat(segments)
            .ToArray()
        );

        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"File not found at path: {fullPath}");

        // 3) open as read‐only stream
        Stream stream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read
        );
        return Task.FromResult(stream);
    }
}
