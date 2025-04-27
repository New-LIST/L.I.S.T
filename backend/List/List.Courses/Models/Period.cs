using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Courses.Models;
    
public class Period
{
    [Key]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
    
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}