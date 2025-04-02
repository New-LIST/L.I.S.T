namespace List.Courses.DTOs;

public class CourseReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PeriodName { get; set; } = string.Empty;

    public int Capacity { get; set; }
    public DateTime? GroupChangeDeadline { get; set; }
    public DateTime? EnrollmentLimit { get; set; }
    public bool HiddenInList { get; set; }
    public bool AutoAcceptStudents { get; set; }
}