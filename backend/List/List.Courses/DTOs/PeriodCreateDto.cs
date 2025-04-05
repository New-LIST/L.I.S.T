using System.ComponentModel.DataAnnotations;


namespace List.Courses.DTOs;

public class PeriodCreateDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}