using List.Emails.Models;

namespace List.Emails.Services;

public interface ISendEmailService
{
    public Task<bool> SendEmailAsync(Email email);
}