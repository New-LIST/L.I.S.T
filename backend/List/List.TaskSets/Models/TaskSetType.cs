namespace List.TaskSets.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class TaskSetType
{
    [Key]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("identifier")]
    public string? Identifier { get; set; }

}
