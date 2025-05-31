// List.Assignments/DTOs/SolutionInfoDto.cs
namespace List.Assignments.DTOs
{
    public class SolutionInfoDto
    {
        public double TestsPoints               { get; set; }
        public double? Points                    { get; set; }
        public string? Comment                  { get; set; }
        public bool Revalidate                  { get; set; }
        public bool DisableEvaluationByTests    { get; set; }
    }
}
