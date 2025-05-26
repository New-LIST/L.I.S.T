using Microsoft.EntityFrameworkCore;
using List.Users.Models;

namespace List.Users.DTOs;

public class AssistantPermissionsDto
{
    public int UserId { get; set; }

    public bool CanAddStudents { get; set; } = false;
    public bool CanManageStudents { get; set; } = false;
    public bool CanManageTaskTypes { get; set; } = false;
    public bool CanManagePeriods { get; set; } = false;
    public bool CanManageCategories { get; set; } = false;
    public bool CanViewLogs { get; set; } = false;
}
