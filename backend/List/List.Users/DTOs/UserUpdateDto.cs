using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using List.Users.Models;

namespace List.Users.DTOs;

public class UserUpdateDto
{
    [Required]
    public string FullName { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }

    [Required, JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}
