using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.Users.Models;

namespace List.Assignments.Models
{
    [Table("solutions")]
    public class SolutionModel
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("created")]
        public DateTime Created { get; set; }

        [Required]
        [Column("updated")]
        public DateTime Updated { get; set; }

        [Required]
        [Column("assignment_id")]
        public int AssignmentId { get; set; }
        public AssignmentModel Assignment { get; set; } = null!;

        [Required]
        [Column("student_id")]
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;

        [Required]
        [Column("teacher_id")]
        public int TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        [Column("comment")]
        public string? Comment { get; set; }

        [Required]
        [Column("tests_points")]
        public double TestsPoints { get; set; }

        [Required]
        [Column("revalidate")]
        public bool Revalidate { get; set; }

        [Required]
        [Column("not_considered")]
        public bool NotConsidered { get; set; }

        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [Required]
        [Column("best_version")]
        public int BestVersion { get; set; }

        [Required]
        [Column("disable_evaluation_by_tests")]
        public bool DisableEvaluationByTests { get; set; }

        [Column("points")]
        public double? Points { get; set; }

        public ICollection<SolutionVersionModel> Versions { get; set; } = new List<SolutionVersionModel>();
    }
}
