namespace List.Emails.Models;

public class EmailTemplate
{
    public Guid Id { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public List<string> Variables { get; set; }
}