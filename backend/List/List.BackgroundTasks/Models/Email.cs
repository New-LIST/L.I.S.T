namespace List.BackgroundTasks.Models;

public class Email
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Destination { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public bool Sent { get; set; }
}