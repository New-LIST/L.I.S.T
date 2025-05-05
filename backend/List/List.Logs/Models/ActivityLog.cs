using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Logs.Models;

[Table("logs")]
public class ActivityLog
{
    [Key]
    public int Id { get; set; }

    [Column("user_id")]
    public string UserId { get; set; } = null!;

    [Column("action")]
    public string Action { get; set; } = null!;

    [Column("target")]
    public string Target { get; set; } = null!;

    [Column("created")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
