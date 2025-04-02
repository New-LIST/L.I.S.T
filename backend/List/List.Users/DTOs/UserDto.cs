using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using List.Users.Models;

namespace List.Users.DTOs;

public class UserDto
{
    [Required]
    public string FullName { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }

    [Required, MinLength(6)]
    public string Password { get; set; }

    [Required, JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}