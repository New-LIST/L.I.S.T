using System.ComponentModel.DataAnnotations;

namespace List.Courses.Models;

public class Course
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    public int? PeriodId { get; set; }
    public Period Period { get; set; } = null!;

    [Required]
    public int Capacity { get; set; }
    public DateTime? GroupChangeDeadline { get; set; }
    public DateTime? EnrollmentLimit { get; set; }
    [Required]
    public bool HiddenInList { get; set; }
    [Required]
    public bool AutoAcceptStudents { get; set; }
}