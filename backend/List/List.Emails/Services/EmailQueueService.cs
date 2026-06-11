using List.Emails.Data;
using List.Emails.Models;

namespace List.Emails.Services;

public class EmailQueueService(EmailQueue queue, EmailsDbContext dbContext) : IEmailQueueService
{
    public async Task InitializeAsync() => await queue.Init(dbContext);

    public async Task<bool> EnqueueEmailAsync(Email email) => await queue.EnqueueEmailAsync(email);

    public IAsyncEnumerable<Email> ReadAllAsync(CancellationToken stoppingToken) => queue.ReadAllAsync(stoppingToken);
}