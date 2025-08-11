using System.Diagnostics;
using System.Text;
using List.Tests.Models;
using Microsoft.AspNetCore.Hosting;

namespace List.Tests.Services;

public class RunScriptService(IWebHostEnvironment env) : IRunScriptService
{
    public async Task<TestResult> RunScriptAsync(Test test, List<string> inputLines = null)
    {
        var fullPath = Path.Combine(env.WebRootPath, test.StorageKey);
        
        var process = new Process();
        process.StartInfo.FileName = "python";
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.CreateNoWindow = true;
        
        process.Start();
        
        var output = new List<string>();
        var error = new List<string>();

        process.OutputDataReceived += (sender, args) => output.Add(args.Data ?? string.Empty);
        process.ErrorDataReceived += (sender, args) => error.Add(args.Data ?? string.Empty);

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await using (var writer = process.StandardInput)
        {
            foreach (var line in inputLines)
            {
                await writer.WriteLineAsync(line);
            }
        }
        
        await process.WaitForExitAsync();

        if (error.Count != 0)
        {
            throw new Exception($"Script error: {error}");
        }
        

        return new TestResult()
        {
            Output = output,
            ExitCode = process.ExitCode,
            Points = 0,
            Bonus = 0
        };
    }
}