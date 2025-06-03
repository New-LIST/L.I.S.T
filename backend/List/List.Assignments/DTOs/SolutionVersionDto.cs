namespace List.Assignments.DTOs
{
    public class SolutionVersionDto
    {
        public int Id { get; set; }
        public int Version { get; set; }
        public string StorageKey { get; set; }

        public string? AssignmentName { get; set; }
        public string? StudentName { get; set; }

    }
}