using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace List.Users.Models;


[Table("Users")]
public class User
{
    [Key]
    public int Id { get; set; }

    [Column("created")]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    [Column("updated")]
    public DateTime Updated { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("full_name")]
    public string Fullname { get; set; }
    
    [Required]
    [EmailAddress]
    [Column("e_mail")]
    public string Email { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; }

    [Column("password_token")]
    public string? PasswordToken { get; set; }

    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    [Column("role")]
    public UserRole Role { get; set; }
    
}