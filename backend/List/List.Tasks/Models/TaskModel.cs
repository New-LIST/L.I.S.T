using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
}