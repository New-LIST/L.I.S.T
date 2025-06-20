namespace List.Tasks.DTOs
{
    public class TaskResponseDto
    {
        public int Id { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Text { get; set; }
        public string? InternalComment { get; set; }
        public int AuthorId { get; set; }
        public string AuthorFullname { get; set; } = string.Empty;

        public int? ParentTaskId { get; set; }
    }
}