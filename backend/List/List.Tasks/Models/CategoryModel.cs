using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Tasks.Models;

[Table("categories")]
public class CategoryModel
{
    [Key]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }
    public CategoryModel? Parent { get; set; }

    public List<CategoryModel> Children { get; set; } = new();

    public ICollection<TaskCategoryRel> TaskCategories { get; set; } = new List<TaskCategoryRel>();
}