using List.BackgroundTasks.Data;
using List.BackgroundTasks.Models;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace List.BackgroundTasks.Services;

public class SendEmailService(BackgroundTasksDbContext dbContext, IConfiguration configuration) : ISendEmailService
{
    public async Task<bool> EnqueueEmailAsync(string destination, string subject, string body)
    {
        var email = new Email()
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.Now,
            Destination = destination,
            Body = body,
            Subject = subject,
            Sent = false
        };

        dbContext.Emails.Add(email);
        await dbContext.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> SendEmailAsync()
    {
        if (!dbContext.Emails.Any())
            return false;
        
        var emailDetails = await dbContext.Emails
            .Where(o => o.Sent == false)
            .OrderBy(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (emailDetails is null)
        {
            return false;
        }

        var emailConfig = new EmailOptions();
        configuration.GetSection(EmailOptions.ConfigSection).Bind(emailConfig);
        
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("Sender Name", emailConfig.SenderEmail));
        email.To.Add(new MailboxAddress("Receiver Name", emailDetails.Destination));

        email.Subject = emailDetails.Subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { 
            Text = emailDetails.Body
        };

        using var smtp = new SmtpClient();
        
        await smtp.ConnectAsync(emailConfig.SmtpServerAddress, emailConfig.SmtpServerPort, false);

        // Note: only needed if the SMTP server requires authentication
        await smtp.AuthenticateAsync("smtp_username", "smtp_password");

        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
        
        emailDetails.Sent = true;
        await dbContext.SaveChangesAsync();
        
        return true;
    }

    public async Task<bool> CleanQueueAsync()
    {
        dbContext.Emails.RemoveRange(dbContext.Emails.Where(x => x.Sent == true));
        await dbContext.SaveChangesAsync();
        
        return true;
    }
}