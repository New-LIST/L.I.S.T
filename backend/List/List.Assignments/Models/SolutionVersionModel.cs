using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.Assignments.Models
{
    [Table("solution_versions")]
    public class SolutionVersionModel
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
        [Column("solution_id")]
        public int SolutionId { get; set; }
        public SolutionModel Solution { get; set; } = null!;

        [Required]
        [Column("version")]
        public int Version { get; set; }

        [Required]
        [Column("download_lock")]
        public bool DownloadLock { get; set; }

        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Required]
        [Column("storage_key")]
        public string StorageKey { get; set; } = null!;
    }
}
