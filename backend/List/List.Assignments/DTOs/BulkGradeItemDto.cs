namespace List.Assignments.DTOs
{
    public class BulkGradeItemDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public double? Points { get; set; }
    }
}
