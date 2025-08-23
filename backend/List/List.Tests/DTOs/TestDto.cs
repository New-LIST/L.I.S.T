using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using List.Tests.Models;

namespace List.Tests.DTOs;

public class TestDto
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    [Required]
    public TestType Type { get; set; }
    [Required]
    public int Timeout { get; set; }
    [Required]
    public bool Allowed { get; set; }
    [Required]
    public bool Evaluate { get; set; }
}