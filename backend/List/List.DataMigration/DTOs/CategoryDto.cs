using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.DataMigration.DTOs;

[Table("courses")]
public class CategoryDto
{
    [Key]
    public int Id { get; set; }

    [Column("created")]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    [Column("updated")]
    public DateTime Updated { get; set; } = DateTime.UtcNow;
    
    [Column("name")]
    public string Name { get; set; } = "";
    
    [Column("parent_id")]
    public int? ParentId { get; set; }
}