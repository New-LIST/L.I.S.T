using List.Emails.Models;

namespace List.Emails.Services;

public interface IEmailTemplateService
{
    public Task<Guid> RegisterEmailTemplateAsync(string subject, string body, List<string> variables);
    public Task<EmailTemplate?> GetEmailTemplateAsync(Guid id);
}