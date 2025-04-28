using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Courses.Models;

[Table("categories")]
public class Category
{
    [Key]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }
    public Category? Parent { get; set; }

    public List<Category> Children { get; set; } = new();
}