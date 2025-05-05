using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Tasks.Models;

[Table("task_category_rel")]
public class TaskCategoryRel
{
    [Column("task_id")]
    public int TaskId { get; set; }

    public TaskModel Task { get; set; } = null!;
    
    [Column("category_id")]
    public int CategoryId { get; set; }

    public CategoryModel Category { get; set; } = null!;
}