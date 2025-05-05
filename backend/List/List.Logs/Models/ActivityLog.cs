using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Logs.Models;
public class ActivityLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Target { get; set; } = null!;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
