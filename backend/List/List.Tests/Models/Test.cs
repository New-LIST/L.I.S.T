using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public Task Task { get; set; }
    public string FilePath { get; set; }
    public List<string> InputLines { get; set; }
}