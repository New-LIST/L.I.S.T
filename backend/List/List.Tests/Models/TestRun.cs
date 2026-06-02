using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace List.Tests.Models;

public class TestRun
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid TestId { get; set; }
    
    [ForeignKey(nameof(TestId))]
    public Test Test { get; set; }
    
    [Required]
    public int Priority { get; set; }
    
    [Required]
    public bool Finished { get; set; }
    
    [Required]
    public DateTime Created { get; set; }
}