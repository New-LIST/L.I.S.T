using List.Emails.Models;

namespace List.Emails.Services;

public interface IEmailService
{
    public Task<bool> SendEmailAsync(string recipient, string subject, string body);
    public Task<IEnumerable<Email>> GetEmailsAsync();
}