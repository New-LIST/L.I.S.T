namespace List.Server.Data.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? PeriodId { get; set; }
        public Period Period { get; set; } = null!;
    }
}