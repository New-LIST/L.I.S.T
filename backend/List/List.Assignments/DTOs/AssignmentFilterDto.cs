namespace List.Assignments.DTOs;

public class AssignmentFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 100;

    public int? UserId { get; set; }
    public string? Name { get; set; }
    public int? CourseId { get; set; }

    public string? Sort { get; set; }
    public bool Desc { get; set; } = false;
}
