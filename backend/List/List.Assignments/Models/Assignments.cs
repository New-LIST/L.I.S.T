using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.TaskSets.Models;
using List.Courses.Models;

namespace List.Assignments.Models;

[Table("assignments")]
public class AssignmentModel
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Created { get; set; }

    [Required]
    public DateTime Updated { get; set; }

    [MaxLength(255)]
    public string Name { get; set; }

    [Required]
    [Column("task_set_type_id")]
    public int TaskSetTypeId { get; set; }

    [ForeignKey(nameof(TaskSetTypeId))]
    public TaskSetType TaskSetType { get; set; } = null!;

    [Required]
    [Column("course_id")]
    public int CourseId { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;

    [Required]
    public bool Published { get; set; }

    public DateTime? PublishStartTime { get; set; }
    public DateTime? UploadEndTime { get; set; }

    public string? Instructions { get; set; }

    public double? PointsOverride { get; set; }

    public string? InternalComment { get; set; }
}
