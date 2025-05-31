namespace List.Assignments.DTOs
{
    public class SubmissionOverviewDto
    {
        public int SolutionId { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Group { get; set; } = null!;
        public int VersionsCount { get; set; }
        public string? LastIpAddress { get; set; }
        public double? Points { get; set; }
    }
}
