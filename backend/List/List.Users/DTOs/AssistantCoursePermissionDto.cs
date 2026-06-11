namespace List.Users.DTOs;

public class AssistantCoursePermissionDto
{
    public int? Id { get; set; }
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public string? CourseName { get; set; }
    public string? PeriodName { get; set; }
    public bool CanViewCourseContent { get; set; }
    public bool CanManageCourseContent { get; set; }
    public bool CanGradeCourse { get; set; }
    public bool CanRunPlagiarismCheck { get; set; }

    public bool HasAnyPermission =>
        CanViewCourseContent ||
        CanManageCourseContent ||
        CanGradeCourse ||
        CanRunPlagiarismCheck;
}
