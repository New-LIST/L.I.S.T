namespace List.Tasks.DTOs
{
	public class taskDto
    {
		public string Name { get; set; } = string.Empty;
		public string? Text { get; set; }
		public string? InternalComment { get; set; }
        public string? AuthorName { get; set; }
    }
}
