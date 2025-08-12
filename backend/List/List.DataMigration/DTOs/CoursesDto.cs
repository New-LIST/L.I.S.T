using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.DataMigration.DTOs;

[Table("courses")]
public class CoursesDto
{
    [Key]
    public int Id { get; set; }
    
    [Column("created")]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    [Column("updated")]
    public DateTime Updated { get; set; } = DateTime.UtcNow;
    
    [Column("name")]
    public string Name { get; set; } = "";
    
    [Column("period_id")]
    public int? PeriodId { get; set; }
    
    [Column("description")]
    public string? Description { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; } = 0;
}