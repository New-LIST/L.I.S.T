
namespace List.Server.Data.DTOs
{
    public class CourseCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int? PeriodId { get; set; }
    }
}