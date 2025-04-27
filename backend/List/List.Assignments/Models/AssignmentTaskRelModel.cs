using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.Tasks.Models;

namespace List.Assignments.Models;

[Table("assignment_task_rel")]
public class AssignmentTaskRelModel
{
    [Key]
    public int TaskId { get; set; }

    [ForeignKey(nameof(TaskId))]
    public TaskModel Task { get; set; } = null!;

    [Key]
    public int AssignmentId { get; set; }

    [ForeignKey(nameof(AssignmentId))]
    public AssignmentModel Assignment { get; set; } = null!;

    [Required]
    public double PointsTotal { get; set; }

    public bool BonusTask { get; set; }

    public string? InternalComment { get; set; }
}
