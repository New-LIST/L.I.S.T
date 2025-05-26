using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Users.Models;

[Table("assistant_permissions")]
public class AssistantPermissions
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; }

    [Column("can_add_students")]
    public bool CanAddStudents { get; set; } = true;

    [Column("can_manage_students")]
    public bool CanManageStudents { get; set; } = true;

    [Column("can_manage_task_types")]
    public bool CanManageTaskTypes { get; set; } = true;

    [Column("can_manage_periods")]
    public bool CanManagePeriods { get; set; } = true;

    [Column("can_manage_categories")]
    public bool CanManageCategories { get; set; } = true;

    [Column("can_view_logs")]
    public bool CanViewLogs { get; set; } = true;
}
