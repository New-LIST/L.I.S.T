namespace List.Logs.DTOs;

public class ActivityLogDto
{
    public string UserId { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Target { get; set; } = null!;
    public int? TargetId { get; set; }
    public string? TargetName { get; set; }
    public string? IpAdress { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Text { get; set; }

    
}
