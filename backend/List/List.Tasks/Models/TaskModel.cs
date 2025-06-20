using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using List.Users.Models;

namespace List.Tasks.Models;

[Table("tasks")]
public class TaskModel
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Created { get; set; }

    [Required]
    public DateTime Updated { get; set; }

    [Required]
    [MaxLength(255)]
    public string? Name { get; set; }


    public string? Text { get; set; }

    public string? InternalComment { get; set; }

    [Required]
    [Column("author_id")]
    public int AuthorId { get; set; }

    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    public ICollection<TaskCategoryRel> TaskCategories { get; set; } = new List<TaskCategoryRel>();

    [Column("parent_task_id")]
    public int? ParentTaskId { get; set; }

    [ForeignKey(nameof(ParentTaskId))]
    public TaskModel? ParentTask { get; set; }

    public ICollection<TaskModel> Variants { get; set; } = new List<TaskModel>();

}