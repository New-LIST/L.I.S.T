using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Users.Models;

[Table( "UserPreferences" )]
public class UserPreferences
{
    [Key]
    public int Id { get; set; }
    
    [ForeignKey( "UserId" )]
    public int UserId { get; set; }
    
    [Column("lang")]
    public string? Language { get; set; }
    
    [Column("course")]
    public int CourseId { get; set; }
}