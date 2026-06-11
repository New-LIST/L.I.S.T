using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Users.Models;

[Table("assistant_course_permissions")]
public class AssistantCoursePermission
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("assistant_user_id")]
    public int AssistantUserId { get; set; }

    [ForeignKey(nameof(AssistantUserId))]
    public User AssistantUser { get; set; } = null!;

    [Required]
    [Column("course_id")]
    public int CourseId { get; set; }

    [Column("can_view_course_content")]
    public bool CanViewCourseContent { get; set; }

    [Column("can_manage_course_content")]
    public bool CanManageCourseContent { get; set; }

    [Column("can_grade_course")]
    public bool CanGradeCourse { get; set; }

    [Column("can_run_plagiarism_check")]
    public bool CanRunPlagiarismCheck { get; set; }

    [Required]
    [Column("created")]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("updated")]
    public DateTime Updated { get; set; } = DateTime.UtcNow;
}
