namespace List.Server.Models;

public class RateLimitingOptions
{
    public const string ConfigSection = "RateLimiting";
    public const string FixedPolicy = "Fixed";
    public int PermitLimit { get; set; } = 100;
    public int Window { get; set; } = 10;
    public int QueueLimit { get; set; } = 2;
}