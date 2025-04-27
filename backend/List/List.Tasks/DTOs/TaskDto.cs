namespace List.Tasks.DTOs
{
	public class taskDto
    {
		public string Name { get; set; } = string.Empty;
		public string? Text { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string? InternalComment { get; set; }
        public string? AuthorName { get; set; }

        public int AuthorId { get; set; }
        public string AuthorFullName { get; set; } = string.Empty;
    }
}
