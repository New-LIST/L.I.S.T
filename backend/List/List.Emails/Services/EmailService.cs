using List.Emails.Data;
using List.Emails.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace List.Emails.Services;

public class EmailService(EmailsDbContext dbContext, IConfiguration configuration, IEmailQueueService emailQueueService) : IEmailService
{
    public async Task<bool> SendEmailAsync(string recipient, string subject, string body)
    {
        var email = new Email()
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            Recipient = recipient,
            Body = body,
            Subject = subject,
            Sent = false
        };
        
        dbContext.Emails.Add(email);
        await dbContext.SaveChangesAsync();
        
        return await emailQueueService.EnqueueEmailAsync(email); 
    }

    public async Task<IEnumerable<Email>> GetEmailsAsync()
    {
        return await dbContext.Emails.ToListAsync();
    }
}