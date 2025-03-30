using System.ComponentModel.DataAnnotations;


namespace List.Server.Data.DTOs
{
    public class CourseCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public int? PeriodId { get; set; }

        [Required]
        public int Capacity { get; set; }
        public DateTime? GroupChangeDeadline { get; set; }
        public DateTime? EnrollmentLimit { get; set; }
        [Required]
        public bool HiddenInList { get; set; }
        [Required]
        public bool AutoAcceptStudents { get; set; }
    }
}