using List.Emails.Data;
using List.Emails.Models;

namespace List.Emails.Services;

public class EmailTemplateService(EmailsDbContext dbContext) : IEmailTemplateService
{
    public async Task<Guid> RegisterEmailTemplateAsync(string subject, string body, List<string> variables)
    {
        var emailTemplate = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            Subject = subject,
            Body = body,
            Variables = variables
        };
        
        await dbContext.EmailTemplates.AddAsync(emailTemplate);
        await dbContext.SaveChangesAsync();

        return emailTemplate.Id;
    }

    public async Task<EmailTemplate?> GetEmailTemplateAsync(Guid id) => await dbContext.FindAsync<EmailTemplate>(id);
}