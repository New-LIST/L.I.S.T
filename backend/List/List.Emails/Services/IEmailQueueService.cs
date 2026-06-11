using List.Emails.Models;

namespace List.Emails.Services;

public interface IEmailQueueService
{
    public Task InitializeAsync();
    public Task<bool> EnqueueEmailAsync(Email email);
    public IAsyncEnumerable<Email> ReadAllAsync(CancellationToken stoppingToken);
}