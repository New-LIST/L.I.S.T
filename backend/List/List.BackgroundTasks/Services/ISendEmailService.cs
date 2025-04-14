namespace List.BackgroundTasks.Services;

public interface ISendEmailService
{
    public Task<bool> EnqueueEmailAsync(string destination, string subject, string body);
    public Task<bool> SendEmailAsync();
    public Task<bool> CleanQueueAsync();
}