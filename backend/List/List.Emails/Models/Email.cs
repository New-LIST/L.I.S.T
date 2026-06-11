namespace List.Emails.Models;

public class Email
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Recipient { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public bool Sent { get; set; }
    public EmailPriority Priority { get; set; } = EmailPriority.Normal;
}