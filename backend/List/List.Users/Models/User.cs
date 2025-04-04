﻿using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace List.Users.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime Updated { get; set; } = DateTime.UtcNow;
    [Required]
    public string Fullname { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    public string? PasswordToken { get; set; }
    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}