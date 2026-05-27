using List.Emails.Data;
using List.Emails.Models;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace List.Emails.Services;

public class SendEmailService(EmailsDbContext dbContext, IConfiguration configuration) : ISendEmailService
{
    public async Task<bool> SendEmailAsync(Email emailEntity)
    {
        var emailConfig = new EmailOptions();
        configuration.GetSection(EmailOptions.ConfigSection).Bind(emailConfig);
        
        var message = CreateMimeMessage(emailEntity, emailConfig);

        try
        {
            using var smtp = new SmtpClient();
        
            await smtp.ConnectAsync(emailConfig.SmtpServerAddress, emailConfig.SmtpServerPort, false);

            // Note: only needed if the SMTP server requires authentication
            await smtp.AuthenticateAsync(emailConfig.SmtpServerUsername, emailConfig.SmtpServerPassword);

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        
            emailEntity.Sent = true;
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email {emailEntity.Id} to {emailEntity.Recipient}");
        }
        
        return true;
    }

    private MimeMessage CreateMimeMessage(Email emailEntity, EmailOptions emailConfig)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(emailConfig.SenderEmail, emailConfig.SenderEmail));
        message.To.Add(new MailboxAddress(emailEntity.Recipient, emailEntity.Recipient));
        message.Subject = emailEntity.Subject;
        message.Body = new TextPart(MimeKit.Text.TextFormat.Html) { 
            Text = emailEntity.Body
        };
        return message;
    }
}