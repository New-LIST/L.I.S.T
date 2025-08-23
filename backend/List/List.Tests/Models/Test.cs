using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.Tasks.Models;

namespace List.Tests.Models;

[Table("Tests")]
public class Test
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    
    [Required]
    public DateTime Created { get; set; }

    [Required]
    public DateTime Updated { get; set; }
    
    [Required]
    [Column("task_id")]
    public int TaskId { get; set; }

    [ForeignKey(nameof(TaskId))]
    public TaskModel Task { get; set; }
    
    [Required]
    public TestType Type { get; set; }
    
    [Required]
    public int Timeout { get; set; } // in milliseconds
    
    [Required]
    public bool Allowed { get; set; }
    
    [Required]
    public bool Evaluate { get; set; }
    
    public string StorageKey { get; set; }
}