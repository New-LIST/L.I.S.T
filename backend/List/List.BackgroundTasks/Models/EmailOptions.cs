namespace List.BackgroundTasks.Models;

public class EmailOptions
{
    public const string ConfigSection = "Email";
    public string SenderEmail { get; set; }
    public string SmtpServerAddress { get; set; }
    public int SmtpServerPort { get; set; }
}