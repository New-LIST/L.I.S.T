using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.Courses.Models;

namespace List.DataMigration.DTOs;

public class PeriodDto
{
    [Key]
    public int Id { get; set; }
    
    [Column("created")]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    [Column("updated")]
    public DateTime Updated { get; set; } = DateTime.UtcNow;
    
    [Column("name")]
    public string Name { get; set; } = "";
    
    [Column("sorting")]
    public int Sorting { get; set; } = 0;

    public Period ToNew()
    {
        var period = new Period();
        
        period.Name = Name;
        
        return period;
    }
}